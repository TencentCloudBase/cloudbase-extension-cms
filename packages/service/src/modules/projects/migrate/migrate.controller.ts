import _ from 'lodash'
import {
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { IsNotEmpty } from 'class-validator'
import { getCloudBaseManager } from '@/utils'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'

class MigrateBody {
  @IsNotEmpty()
  filePath: string

  @IsNotEmpty()
  collectionName: string

  @IsNotEmpty()
  conflictMode: 'insert' | 'upsert'
}

interface MigrateJobDto {
  // 项目 Id
  projectId: string

  // 任务 Id
  jobId: number

  // 导入文件路径
  filePath: string

  // 导入冲突处理模式
  conflictMode: 'upsert' | 'insert'

  createTime: number

  collectionName: string

  // 任务状态
  // waiting：等待中，reading：读，writing：写，migrating：转移中，success：成功，fail：失败
  status?: string
}

@UseGuards(PermissionGuard('content', [SYSTEM_ROLE_IDS.ADMIN]))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/migrate')
export class MigrateController {
  constructor(public cloudbaseService: CloudBaseService) {}

  @Get()
  async listMigrateJobs(
    @Param('projectId') projectId,
    @Query() query: { page: number; pageSize: number }
  ) {
    const { page = 1, pageSize = 10 } = query

    const dbQuery = this.collection()
      .where({
        projectId,
      })
      .limit(Number(pageSize))
      .skip(Number(page - 1) * pageSize)

    const { total } = await dbQuery.count()
    const { data } = await dbQuery.get()
    const manager = await getCloudBaseManager()
    if (!data?.length) {
      return {
        total: 0,
        data: [],
      }
    }

    const requests = data.map(async (job: MigrateJobDto) => {
      const { Status } = await manager.database.migrateStatus(job.jobId)

      return {
        ...job,
        status: Status,
      }
    })

    const jobs = await Promise.all(requests)

    return {
      data: jobs,
      total,
    }
  }

  /**
   * 创建迁移任务
   */
  @Post()
  async createMigrateJob(
    @Param('projectId') projectId,
    @Body() body: MigrateBody,
    @Request() req: IRequest
  ) {
    const { filePath, collectionName, conflictMode } = body
    const manager = await getCloudBaseManager()

    // 导入数据
    const { JobId } = await manager.database.import(
      collectionName,
      {
        ObjectKey: filePath,
      },
      {
        StopOnError: true,
        ConflictMode: conflictMode,
      }
    )

    const jobRecord: MigrateJobDto = {
      projectId,
      conflictMode,
      collectionName,
      jobId: JobId,
      filePath,
      createTime: Date.now(),
    }

    // 添加记录
    return this.collection().add(jobRecord)
  }

  collection(collection = Collection.DataMigrateTasks) {
    return this.cloudbaseService.collection(collection)
  }
}
