import { Controller, Post, Body, UseGuards, Request, Param } from '@nestjs/common'
import { IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { CollectionV2 } from '@/constants'
import { checkAccessAndGetResource } from '@/utils'
import { ContentsService } from '../contents/contents.service'
import { Webhook } from './type'

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
    @Request() req: AuthRequest
  ) {
    const {
      action,
      options = {
        page: 1,
        pageSize: 20,
      },
    } = body

    const webhookId = options?.filter?._id

    checkAccessAndGetResource(projectId, req, webhookId)

    return this.contentsService[action](CollectionV2.Webhooks, options as any)
  }
}
