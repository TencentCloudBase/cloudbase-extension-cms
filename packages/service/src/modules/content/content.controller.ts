import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common'
import { IsNotEmpty, IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { checkAccessAndGetResource } from '@/utils'
import { ContentService } from './content.service'
import { WebhookService } from '../webhook/webhook.service'
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

class ActionBody {
  @IsNotEmpty()
  projectId: string

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

  options?: {
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
}

class SchemaQuery {
  @IsNotEmpty()
  projectId: string

  page?: number

  pageSize?: number
}

@UseGuards(PermissionGuard('content'))
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly webhookService: WebhookService,
    private readonly cloudbaseService: CloudBaseService
  ) {}

  @Get('schema')
  async getContentSchemas(@Query() query: SchemaQuery, @Request() req: AuthRequest) {
    const { projectId, page = 1, pageSize = 100 } = query

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

  @Post()
  async handleAction(@Body() body: ActionBody, @Request() req: AuthRequest) {
    const {
      projectId,
      action,
      resource,
      options = {
        page: 1,
        pageSize: 20,
      },
    } = body

    // 内容以原型为维度，不支持单个内容权限管理
    // 这里的 resource 是 collectionName
    checkAccessAndGetResource(projectId, req, resource)

    let res = await this.contentService[action](resource, options as any)

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
