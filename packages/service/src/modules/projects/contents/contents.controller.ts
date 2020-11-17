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
  HttpCode,
} from '@nestjs/common'
import { IsNotEmpty, IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { CollectionV2 } from '@/constants'
import { UnsupportedOperation } from '@/common'
import { checkAccessAndGetResource } from '@/utils'
import { CloudBaseService } from '@/services'
import { ContentsService } from './contents.service'
import { WebhooksService } from '../webhooks/webhooks.service'

const validActions = [
  'getOne',
  'getMany',
  'setOne',
  'createOne',
  'updateOne',
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
  action: 'getOne' | 'getMany' | 'createOne' | 'updateOne' | 'deleteOne' | 'deleteMany'

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
  @HttpCode(200)
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
        pageSize: 10,
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
