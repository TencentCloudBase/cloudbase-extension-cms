import _ from 'lodash'
import { Controller, Post, Body, UseGuards, Request, Get, Query, Param } from '@nestjs/common'
import { IsNotEmpty, IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { checkAccessAndGetResource } from '@/utils'
import { ContentsService } from './contents.service'
import { WebhooksService } from '../webhooks/webhooks.service'
import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2 } from '@/constants'

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

  @Get(':resource')
  async getResourceEntries(
    @Param() params,
    @Query()
    query: QuerySearch,
    @Request() req: AuthRequest
  ) {
    const { projectId, resource } = params
    checkAccessAndGetResource(projectId, req, resource)

    const options = {}

    Object.keys(query)
      .filter((key) => query[key])
      .forEach((key) => _.set(options, key, query[key]))

    return this.contentsService.getMany(resource, options)
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
    checkAccessAndGetResource(projectId, req, resource)

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
}
