import { Controller, Post, Body } from '@nestjs/common'
import { IsIn } from 'class-validator'
import { CollectionV2 } from '@/constants'
import { ContentService } from '../content/content.service'

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
            [key: string]: string
        }
        sort?: {
            [key: string]: 'ascend' | 'descend'
        }
        payload?: Record<string, any>
    }
}
@Controller('cam')
export class CamController {
    constructor(private readonly contentService: ContentService) {}

    @Post()
    async handleAction(@Body() body: ActionBody) {
        const {
            action,
            options = {
                page: 1,
                pageSize: 10,
            },
        } = body

        return this.contentService[action](CollectionV2.CamPolices, options as any)
    }
}
