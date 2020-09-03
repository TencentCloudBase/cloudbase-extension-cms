import _ from 'lodash'
import {
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
  Patch,
  Request,
  UseGuards,
  Controller,
} from '@nestjs/common'
import { IsNotEmpty, IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { CollectionV2 } from '@/constants'
import { UnsupportedOperation } from '@/common'
import { checkAccessAndGetResource } from '@/utils'
import { CloudBaseService } from '@/dynamic_modules'
import { ContentsService } from './contents.service'
import { WebhooksService } from '../webhooks/webhooks.service'

const validActions = [
  'getOne',
  'getMany',
  'createOne',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
]

interface QuerySearch {
  page?: number
  pageSize?: number
  filter?: {
    _id?: string
    ids?: string[]
    [key: string]: any
  }
  fuzzyFilter?: {
    [key: string]: any
  }
  sort?: {
    [key: string]: 'ascend' | 'descend'
  }
  payload?: Record<string, any>
}

class ActionBody {
  @IsNotEmpty()
  resource: string

  @IsIn(validActions)
  action:
    | 'getOne'
    | 'getMany'
    | 'createOne'
    | 'updateOne'
    | 'updateMany'
    | 'deleteOne'
    | 'deleteMany'

  options?: QuerySearch
}

class SchemaQuery {
  page?: number

  pageSize?: number
}

@UseGuards(PermissionGuard('content'))
@Controller('projects/:projectId/contents')
export class ContentsController {
  constructor(
    private readonly contentsService: ContentsService,
    private readonly webhookService: WebhooksService,
    private readonly cloudbaseService: CloudBaseService
  ) {}

  // 获取内容 schema 集合
  @Get()
  async getContentSchemas(
    @Param('projectId') projectId,
    @Query() query: SchemaQuery,
    @Request() req: AuthRequest
  ) {
    const { page = 1, pageSize = 100 } = query

    const collectionNames = checkAccessAndGetResource(projectId, req)

    const $ = this.cloudbaseService.db.command
    const filter: any = {}
    projectId && (filter.projectId = projectId)

    if (collectionNames !== '*') {
      filter.collectionName = $.in(collectionNames)
    }

    const { data, requestId } = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where(filter)
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data,
      requestId,
    }
  }

  // Admin Panel 入口
  @Post()
  async handleAction(
    @Param('projectId') projectId,
    @Body() body: ActionBody,
    @Request() req: AuthRequest
  ) {
    const {
      action,
      resource,
      options = {
        page: 1,
        pageSize: 20,
      },
    } = body

    // 内容以模型为维度，不支持单个内容权限管理
    // 这里的 resource 是 collectionName
    await this.checkResourcePermission(projectId, req, resource)

    let res = await this.contentsService[action](resource, options as any)

    // get 不触发 webhook
    if (action === 'getOne' || action === 'getMany') {
      return res
    }

    try {
      // 调用 webhook
      await this.webhookService.callWebhook({
        projectId,
        resource,
        action,
        actionRes: res,
        actionOptions: options,
      })
      console.log('Webhook 触发成功！')
    } catch (error) {
      console.log('Webhook 触发失败', error)
    }

    return res
  }

  // 获取所有文档
  @Get(':resource/docs')
  async getResourceDocs(
    @Param() params,
    @Query()
    query: QuerySearch,
    @Request() req: AuthRequest
  ) {
    const { projectId, resource } = params
    await this.checkResourcePermission(projectId, req, resource)

    const options = {}

    Object.keys(query)
      .filter((key) => query[key])
      .forEach((key) => _.set(options, key, query[key]))

    return this.contentsService.getMany(resource, options)
  }

  // 获取单个文档信息
  @Get(':resource/docs/:docId')
  async getResourceDoc(@Param() params, @Request() req: AuthRequest) {
    const { projectId, resource, docId } = params
    await this.checkResourcePermission(projectId, req, resource)

    const options = {
      filter: {
        _id: docId,
      },
    }

    return this.contentsService.getOne(resource, options)
  }

  // 创建文档
  @Post(':resource/docs')
  async createResourceDoc(
    @Param() params,
    @Body() payload: Record<string, any>,
    @Request() req: AuthRequest
  ) {
    const { projectId, resource } = params
    await this.checkResourcePermission(projectId, req, resource)

    return this.contentsService.createOne(resource, {
      payload,
    })
  }

  // 更新单个文档
  @Patch(':resource/docs/:docId')
  async updateResourceDoc(
    @Param() params,
    @Body() payload: Record<string, any>,
    @Request() req: AuthRequest
  ) {
    const { projectId, resource, docId } = params
    await this.checkResourcePermission(projectId, req, resource)

    return this.contentsService.updateOne(resource, {
      filter: {
        _id: docId,
      },
      payload,
    })
  }

  // 删除单个文档
  @Delete(':resource/docs/:docId')
  async deleteResourceDoc(@Param() params, @Request() req: AuthRequest) {
    const { projectId, resource, docId } = params
    await this.checkResourcePermission(projectId, req, resource)

    return this.contentsService.deleteOne(resource, {
      filter: {
        _id: docId,
      },
    })
  }

  // 二次校验权限
  private async checkResourcePermission(projectId: string, req: AuthRequest, resource: string) {
    // 检查 CMS 系统角色
    checkAccessAndGetResource(projectId, req, resource)

    const {
      data: [schema],
    } = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where({
        collectionName: resource,
      })
      .get()

    // CMS 只能操作 CMS 管理的集合，不能操作非 CMS 管理的集合
    if (!schema) {
      throw new UnsupportedOperation('集合记录不存在，无法操作，请检查此集合是否在 CMS 系统记录中')
    }
  }
}
