import { IsNotEmpty } from 'class-validator'
import { Controller, Post, Body, Get, Query, Param, Put, Delete } from '@nestjs/common'
import { CollectionV2 } from '@/constants'
import { RecordExistException } from '@/common'
import { CloudBaseService } from '@/dynamic_modules/cloudbase'
import { dateToNumber } from '@/utils'

export class Project {
    _id: string

    @IsNotEmpty()
    name: string

    description: string

    // project cover image url
    cover?: string
}

const Default_Projects = [
    {
        _id: 'default',
        name: '默认项目',
        description: 'CMS 默认项目',
    },
]

@Controller('project')
export class ProjectController {
    constructor(private readonly cloudbaseService: CloudBaseService) {}

    @Get(':id')
    async getProject(@Param('id') id: string) {
        if (id === 'default') {
            return {
                data: {
                    _id: 'default',
                    name: '默认项目',
                    description: 'CMS 默认项目',
                },
            }
        }

        const { data } = await this.cloudbaseService.collection(CollectionV2.Projects).doc(id).get()

        return {
            data: data?.[0],
        }
    }

    @Get()
    async getProjects(
        @Query()
        query: { page?: number; pageSize?: number } = {}
    ) {
        const { page = 1, pageSize = 100 } = query

        const res = await this.cloudbaseService
            .collection(CollectionV2.Projects)
            .where({})
            .skip(Number(page - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .get()

        return {
            data: [...Default_Projects, ...res.data],
        }
    }

    // create a project
    @Post()
    async createProject(@Body() body: Project) {
        const { name } = body

        // 检查同名项目是否已经存在
        const { data } = await this.cloudbaseService
            .collection(CollectionV2.Projects)
            .where({
                name,
            })
            .limit(1)
            .get()

        if (data?.length) {
            throw new RecordExistException()
        }

        const project = {
            ...body,
            _createTime: dateToNumber(),
        }
        return this.cloudbaseService.collection(CollectionV2.Projects).add(project)
    }

    @Put(':id')
    async updateProject(@Param('id') id: string, @Body() payload: Partial<Project>) {
        return this.cloudbaseService.collection(CollectionV2.Projects).doc(id).update(payload)
    }

    @Delete(':id')
    async deleteProject(@Param('id') id: string) {
        return this.cloudbaseService.collection(CollectionV2.Projects).doc(id).remove()
    }
}
