import _ from 'lodash'
import {
  Post,
  Body,
  Get,
  Query,
  Param,
  Request,
  UseGuards,
  Controller,
  HttpCode,
} from '@nestjs/common'
import { IsNotEmpty, IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { Collection } from '@/constants'
import { UnsupportedOperation } from '@/common'
import { checkAccessAndGetResource } from '@/utils'
import { CloudBaseService, SchemaCacheService } from '@/services'
import { ContentsService } from './contents.service'
import { WebhooksService } from '../webhooks/webhooks.service'

const validActions = ['getMany', 'setOne', 'createOne', 'updateOne', 'deleteOne', 'deleteMany']

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
  action: 'getMany' | 'createOne' | 'updateOne' | 'deleteOne' | 'deleteMany'

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
    private readonly cloudbaseService: CloudBaseService,
    private readonly schemaCacheService: SchemaCacheService
  ) {}

  // 获取内容 schema 集合
  @Get()
  async getContentSchemas(
    @Param('projectId') projectId,
    @Query() query: SchemaQuery,
    @Request() req: IRequest
  ) {
    const { page = 1, pageSize = 100 } = query

    const collectionNames = checkAccessAndGetResource({
      req,
      projectId,
      action: 'get',
    })

    const $ = this.cloudbaseService.db.command

    let filter: any = {}
    let filterCollection

    if (collectionNames !== '*') {
      filterCollection = $.in(collectionNames)
    }

    if (projectId) {
      filter = $.or(
        { projectId, collectionName: filterCollection },
        {
          collectionName: filterCollection,
          projectIds: $.elemMatch($.eq(projectId)),
        }
      )
    }

    const { data, requestId } = await this.cloudbaseService
      .collection(Collection.Schemas)
      .where(filter)
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data,
      requestId,
    }
  }

  @Get(':schemaId')
  async getContentSchema(@Param() params, @Request() req: IRequest) {
    const { projectId, schemaId } = params

    checkAccessAndGetResource({
      req,
      projectId,
      action: 'get',
      resourceId: schemaId,
    })

    const {
      data: [schema],
      requestId,
    } = await this.cloudbaseService.collection(Collection.Schemas).doc(schemaId).get()

    return {
      data: schema,
      requestId,
    }
  }

  // Admin Panel 入口
  @Post()
  @HttpCode(200)
  async handleAction(
    @Param('projectId') projectId,
    @Body() body: ActionBody,
    @Request() req: IRequest
  ) {
    const {
      action,
      resource,
      options = {
        page: 1,
        pageSize: 10,
      },
    } = body

    // 内容以模型为维度，不支持单个内容权限管理
    // 这里的 resource 是 collectionName
    await this.checkResourcePermission(projectId, req, action, resource)

    let res = await this.contentsService[action](resource, options as any)

    // get 不触发 webhook
    if (action === 'getMany') {
      return res
    }

    try {
      // 调用 webhook
      await this.webhookService.callWebhook({
        projectId,
        resource,
        action,
        actionRes: res,
        user: req.cmsUser,
        actionOptions: options,
      })
    } catch (error) {
      console.error('Webhook 触发失败', error)
    }

    return res
  }

  // 二次校验权限
  private async checkResourcePermission(
    projectId: string,
    req: IRequest,
    action: string,
    resource: string
  ) {
    // 检查 CMS 系统角色
    checkAccessAndGetResource({
      req,
      action,
      projectId,
      resourceId: resource,
    })

    // 获取并缓存 schema
    const schema = await this.schemaCacheService.getCollectionSchema(resource)

    if (!schema) {
      return
    }

    // CMS 只能操作 CMS 管理的集合，不能操作非 CMS 管理的集合
    if (!schema) {
      throw new UnsupportedOperation('集合记录不存在，无法操作，请检查此集合是否在 CMS 系统记录中')
    }
  }
}
