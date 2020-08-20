import { IsNotEmpty } from 'class-validator'
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Put,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common'
import { dateToNumber, checkAccessAndGetResource } from '@/utils'
import { CollectionV2 } from '@/constants'
import { PermissionGuard } from '@/guards'
import { RecordExistException } from '@/common'
import { CloudBaseService } from '@/dynamic_modules/cloudbase'

export class Project {
  _id: string

  @IsNotEmpty()
  name: string

  description: string

  // 项目封面图
  cover?: string
}

@Controller('project')
export class ProjectController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get(':id')
  async getProject(@Param('id') id: string, @Request() req: AuthRequest) {
    checkAccessAndGetResource(id, req, id)

    const { data } = await this.cloudbaseService.collection(CollectionV2.Projects).doc(id).get()

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

    const allProjects = Object.keys(req.cmsUser.projectResource)

    // 可获取的所有项目列表
    if (!allProjects.some((_) => _ === '*')) {
      const $ = this.cloudbaseService.db.command
      filter._id = $.in(allProjects)
    }

    const { data } = await this.cloudbaseService
      .collection(CollectionV2.Projects)
      .where(filter)
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data,
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
    return this.cloudbaseService.collection(CollectionV2.Projects).add(project)
  }

  // 系统管理员才能更新项目
  @Put(':id')
  @UseGuards(PermissionGuard('project', ['administrator']))
  async updateProject(
    @Param('id') id: string,
    @Body() payload: Partial<Project>,
    @Request() req: AuthRequest
  ) {
    checkAccessAndGetResource(id, req, id)

    return this.cloudbaseService.collection(CollectionV2.Projects).doc(id).update(payload)
  }

  // 系统管理员才能删除项目
  @UseGuards(PermissionGuard('project', ['administrator']))
  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Request() req: AuthRequest) {
    checkAccessAndGetResource(id, req, id)

    return this.cloudbaseService.collection(CollectionV2.Projects).doc(id).remove()
  }
}
