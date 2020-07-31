import { Controller, Post, Body } from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules/cloudbase'
import { ContentService } from './content.service'
import { IsNotEmpty, IsIn } from 'class-validator'

const validActions = [
    'getOne',
    'getMany',
    'create',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany'
]

class ActionBody {
    @IsNotEmpty()
    resource: string

    @IsIn(validActions)
    action:
        | 'getOne'
        | 'getMany'
        | 'create'
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

        sort?: {
            [key: string]: 'ascend' | 'descend'
        }
        payload?: Record<string, any>
    }
}

@Controller('content')
export class ContentController {
    constructor(private contentService: ContentService) {}

    @Post()
    async handleAction(@Body() body: ActionBody) {
        const { action, resource, options } = body

        return this.contentService[action](resource, options)
    }
}
