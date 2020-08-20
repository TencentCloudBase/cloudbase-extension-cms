import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common'
import { IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { CollectionV2 } from '@/constants'
import { checkAccessAndGetResource } from '@/utils'
import { ContentService } from '../content/content.service'
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
@Controller('webhook')
export class WebhookController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async handleAction(@Body() body: ActionBody, @Request() req: AuthRequest) {
    const {
      action,
      options = {
        page: 1,
        pageSize: 20,
      },
    } = body

    const projectId = options?.filter?.projectId
    const webhookId = options?.filter._id

    checkAccessAndGetResource(projectId, req, webhookId)

    return this.contentService[action](CollectionV2.Webhooks, options as any)
  }
}
