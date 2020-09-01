import _ from 'lodash'
import { IsNotEmpty } from 'class-validator'
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { UnauthorizedOperation, RecordExistException } from '@/common'
import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2 } from '@/constants'
import { dateToNumber } from '@/utils'

export class Project {
  _id: string

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  customId: string

  description: string

  // 项目封面图
  cover?: string
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get(':id')
  async getProject(@Param('id') id: string, @Request() req: AuthRequest) {
    this.checkAccessAndGetProjects(req, id)

    const { data } = await this.collection().doc(id).get()

    return {
      data: data?.[0],
    }
  }

  @Get()
  async getProjects(
    @Query() query: { page?: number; pageSize?: number } = {},
    @Request() req: AuthRequest
  ) {
    const { page = 1, pageSize = 100 } = query
    const filter: any = {}
    const allProjects = this.checkAccessAndGetProjects(req)

    // 可获取的所有项目列表
    if (!allProjects?.some((_) => _ === '*')) {
      const $ = this.cloudbaseService.db.command
      filter._id = $.in(allProjects)
    }

    const dbQuery = this.collection().where(filter)
    const countRes = await dbQuery.count()

    const { data } = await dbQuery
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data,
      total: countRes.total,
    }
  }

  // 系统管理员才能创建项目
  @UseGuards(PermissionGuard('project', ['administrator']))
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
    return this.collection().add(project)
  }

  // 系统管理员才能更新项目
  @Patch(':id')
  @UseGuards(PermissionGuard('project', ['administrator']))
  async updateProject(@Param('id') id: string, @Body() payload: Partial<Project>) {
    return this.collection().doc(id).update(payload)
  }

  // 系统管理员才能删除项目
  @UseGuards(PermissionGuard('project', ['administrator']))
  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    // 删除此项目的 schema
    await this.collection(CollectionV2.Schemas)
      .where({
        projectId: id,
      })
      .remove()

    // 删除此项目的 Webhooks
    await this.collection(CollectionV2.Webhooks)
      .where({
        projectId: id,
      })
      .remove()

    return this.collection().doc(id).remove()
  }

  private collection(collection = CollectionV2.Projects) {
    return this.cloudbaseService.collection(collection)
  }

  private checkAccessAndGetProjects(req: AuthRequest, projectId?: string) {
    const { projectResource = {} } = req.cmsUser

    // projectResource 为空，无权限
    if (_.isEmpty(projectResource)) {
      throw new UnauthorizedOperation('您没有此资源的访问权限')
    }

    const allProjects = Object.keys(projectResource)

    if (projectId && !allProjects.includes(projectId) && !allProjects.includes('*')) {
      throw new UnauthorizedOperation('您没有此资源的访问权限')
    }

    return allProjects
  }
}
