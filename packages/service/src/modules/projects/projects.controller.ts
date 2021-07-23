import _ from 'lodash'
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
import { CloudBaseService } from '@/services'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'
import { dateToUnixTimestampInMs } from '@/utils'
import { ProjectsService } from './projects.service'

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly cloudbaseService: CloudBaseService,
    private readonly projectsService: ProjectsService
  ) {}

  @Get(':id')
  async getProject(@Param('id') id: string, @Request() req: IRequest) {
    this.checkAccessAndGetProjects(req, id)

    const { data } = await this.collection().doc(id).get()

    return {
      data: data?.[0],
    }
  }

  @Get()
  async getProjects(
    @Query() query: { page?: number; pageSize?: number } = {},
    @Request() req: IRequest
  ) {
    const { page = 1, pageSize = 1000 } = query
    const filter: any = {}
    const allProjects = this.checkAccessAndGetProjects(req)

    // 可获取的所有项目列表
    if (!allProjects?.some((_) => _ === '*')) {
      const $ = this.cloudbaseService.db.command
      filter._id = $.in(allProjects)
    }

    const dbQuery = this.collection().where(filter)
    const { total } = await dbQuery.count()

    const { data } = await dbQuery
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data,
      total,
    }
  }

  // 系统管理员才能创建项目
  @UseGuards(PermissionGuard('project', [SYSTEM_ROLE_IDS.ADMIN]))
  @Post()
  async createProject(@Body() body: Project) {
    const { name } = body

    // 检查同名项目是否已经存在
    const { data } = await this.cloudbaseService
      .collection(Collection.Projects)
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
      _createTime: dateToUnixTimestampInMs(),
    }
    return this.collection().add(project)
  }

  // 系统管理员才能更新项目
  @Patch(':id')
  @UseGuards(PermissionGuard('project', [SYSTEM_ROLE_IDS.ADMIN]))
  async updateProject(
    @Param('id') id: string,
    @Body() payload: Partial<Project> & { keepApiPath?: boolean } = {}
  ) {
    const { enableApiAccess, apiAccessPath, keepApiPath } = payload
    // 项目信息
    const {
      data: [project],
    } = await this.collection().doc(id).get()

    // 开启、关闭 API 访问
    if (typeof enableApiAccess === 'boolean') {
      // 开启 API 访问，且已存在 API 访问路径，则恢复 API 访问路径
      if (enableApiAccess && project.apiAccessPath) {
        await this.projectsService.createApiAccessPath(`/${project.apiAccessPath}`)
      }

      if (enableApiAccess === false && project.apiAccessPath) {
        await this.projectsService.deleteApiAccessPath(`/${project.apiAccessPath}`)
      }
    }

    // API 访问路径
    if (typeof apiAccessPath !== 'undefined') {
      // 检查路径是否已被其他项目绑定
      const {
        data: [existProject],
      } = await this.collection()
        .where({
          apiAccessPath,
        })
        .get()

      // 其他项目已经绑定了此路径
      if (existProject) {
        if (existProject?._id !== id) {
          throw new RecordExistException('路径已被其他项目绑定，请更换路径后重试')
        } else {
          // 再次创建，确保创建成功
          await this.projectsService.createApiAccessPath(`/${apiAccessPath}`)
        }
      } else {
        // 创建新的路径
        await this.projectsService.createApiAccessPath(`/${apiAccessPath}`)

        // 删除已有路径
        if (!keepApiPath) {
          await this.projectsService.deleteApiAccessPath(`/${project.apiAccessPath}`)
        }
      }
    }

    return this.collection().doc(id).update(payload)
  }

  // 系统管理员才能删除项目
  @UseGuards(PermissionGuard('project', [SYSTEM_ROLE_IDS.ADMIN]))
  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    // 删除此项目的 schema
    await this.collection(Collection.Schemas)
      .where({
        projectId: id,
      })
      .remove()

    // 删除此项目的 Webhooks
    await this.collection(Collection.Webhooks)
      .where({
        projectId: id,
      })
      .remove()

    // 删除项目
    return this.collection().doc(id).remove()
  }

  private collection(collection = Collection.Projects) {
    return this.cloudbaseService.collection(collection)
  }

  private checkAccessAndGetProjects(req: IRequest, projectId?: string) {
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
