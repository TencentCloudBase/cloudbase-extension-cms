import { Controller, Post, Body, UseGuards, Request, Param } from '@nestjs/common'
import { IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { Collection } from '@/constants'
import { checkAccessAndGetResource } from '@/utils'
import { ContentsService } from '../contents/contents.service'
import { Webhook } from './type'

const validActions = ['getMany', 'createOne', 'updateOne', 'deleteOne', 'deleteMany']

class ActionBody {
  @IsIn(validActions)
  action: 'getMany' | 'createOne' | 'updateOne' | 'deleteOne' | 'deleteMany'

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
    payload?: Partial<Webhook>
  }
}

@UseGuards(PermissionGuard('webhook'))
@Controller('projects/:projectId/webhooks')
export class WebhooksController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  async handleAction(
    @Param('projectId') projectId,
    @Body() body: ActionBody,
    @Request() req: IRequest
  ) {
    const {
      action,
      options = {
        page: 1,
        pageSize: 10,
      },
    } = body

    const webhookId = options?.filter?._id

    checkAccessAndGetResource({
      req,
      action,
      projectId,
      resourceId: webhookId,
    })

    // 添加过滤条件
    options.filter = {
      ...options.filter,
      projectId,
    }

    return this.contentsService[action](Collection.Webhooks, options as any)
  }

  /**
   * 查询 webhook 执行日志
   */
  @Post('log')
  async handleLogAction(
    @Param('projectId') projectId,
    @Body() body: ActionBody,
    @Request() req: IRequest
  ) {
    const {
      action,
      options = {
        page: 1,
        pageSize: 10,
      },
    } = body

    const webhookId = options?.filter?._id

    checkAccessAndGetResource({
      req,
      action,
      projectId,
      resourceId: webhookId,
    })

    // 添加过滤条件
    options.filter = {
      ...options.filter,
      projectId,
    }

    return this.contentsService[action](Collection.WebhookLog, options as any)
  }
}
