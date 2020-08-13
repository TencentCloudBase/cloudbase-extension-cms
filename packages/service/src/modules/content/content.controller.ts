import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common'
import { ContentService } from './content.service'
import { IsNotEmpty, IsIn } from 'class-validator'
import { PermissionGuard } from '@/guards'
import { checkAccessAndGetResource } from '@/utils'

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
            [key: string]: string
        }
        sort?: {
            [key: string]: 'ascend' | 'descend'
        }
        payload?: Record<string, any>
    }
}

@UseGuards(PermissionGuard('content'))
@Controller('content')
export class ContentController {
    constructor(private contentService: ContentService) {}

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
        checkAccessAndGetResource(projectId, req, resource)

        return this.contentService[action](resource, options as any)
    }
}
