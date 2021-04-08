import fs from 'fs'
import readline from 'readline'
import _ from 'lodash'
import {
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpService,
} from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { IsNotEmpty } from 'class-validator'
import { getCloudBaseApp, getCloudBaseManager, getCollectionSchema, randomId, sleep } from '@/utils'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'
import { CmsException, ErrorCode } from '@/common'

class ImportBody {
  @IsNotEmpty()
  filePath: string

  fileID: string

  @IsNotEmpty()
  collectionName: string

  @IsNotEmpty()
  conflictMode: 'insert' | 'upsert'

  /**
   * 导入文件类型
   */
  fileType: 'json' | 'csv' | 'jsonlines'
}

class ExportBody {
  /**
   * 导出集合名
   */
  @IsNotEmpty()
  collectionName: string

  /**
   * 导出文件类型
   */
  fileType: 'json' | 'csv'

  options: {}
}

interface MigrateJobDto {
  // 项目 ID
  projectId: string

  // 任务 Id
  jobId: number

  // 文件路径
  filePath: string

  createTime: number

  collectionName: string

  /**
   * 任务类型：导入或导出
   */
  jobType: 'export' | 'import'

  /**
   * 导入冲突处理模式
   */
  conflictMode?: 'upsert' | 'insert'

  /**
   * 任务状态
   * waiting：等待中，reading：读，writing：写，migrating：转移中，success：成功，fail：失败
   */
  status?: 'waiting' | 'reading' | 'writing' | 'migrating' | 'success' | 'fail'
}

@UseGuards(PermissionGuard('content', [SYSTEM_ROLE_IDS.ADMIN]))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/migrate')
export class MigrateController {
  constructor(private cloudbaseService: CloudBaseService, private httpService: HttpService) {}

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
      const { Status, FileUrl } = await manager.database.migrateStatus(job.jobId)

      return {
        ...job,
        status: Status,
        // 下载链接
        fileUrl: FileUrl,
      }
    })

    const jobs = await Promise.all(requests)

    return {
      total,
      data: jobs,
    }
  }

  /**
   * 创建导入数据任务
   */
  @Post()
  async createImportMigrateJob(@Param('projectId') projectId, @Body() body: ImportBody) {
    const { filePath, fileID, fileType, collectionName, conflictMode } = body

    const app = getCloudBaseApp()
    const manager = await getCloudBaseManager()

    const tempFilePath = `/tmp/${randomId()}-import.json`

    // 将 json 转换成 json lines
    if (fileType === 'json') {
      // 下载文件
      await app.downloadFile({
        fileID,
        tempFilePath,
      })

      // 读取，重新写入
      const tmpJsonFilePath = `/tmp/${randomId()}-import-format.json`

      // TODO 等待 fd 关闭
      await sleep(200)

      const data: any[] = JSON.parse(fs.readFileSync(tempFilePath).toString())
      data.forEach((item) => {
        fs.appendFileSync(tmpJsonFilePath, `${JSON.stringify(item)}\n`)
      })

      // 重新上传覆盖文件
      await app.uploadFile({
        cloudPath: filePath,
        fileContent: fs.createReadStream(tmpJsonFilePath),
      })
    }

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
      filePath,
      projectId,
      conflictMode,
      collectionName,
      jobId: JobId,
      jobType: 'import',
      createTime: Date.now(),
    }

    // 添加记录
    return this.collection().add(jobRecord)
  }

  /**
   * 创建导出任务
   */
  @Post('export')
  async createExportMigrateJob(@Param('projectId') projectId, @Body() body: ExportBody) {
    const { collectionName, fileType } = body
    const manager = await getCloudBaseManager()

    const filePath = `cloudbase-cms/data-export/${randomId(32)}-export.${fileType}`

    // 导出全量数据，jsonlines 或 csv
    const exportOptions: any = {
      // Fields: '_id,name',
      // Query: '{"name":{"$exists":true}}',
      // Sort: '{"name": -1}',
      // Skip: 0,
      // Limit: 1000,
    }

    // CSV 文件需要指定导出的字段名
    if (fileType === 'csv') {
      const schema = await getCollectionSchema(collectionName)
      exportOptions.Fields = schema.fields.map((_) => _.name).join(',')
    }

    const { JobId } = await manager.database.export(
      collectionName,
      {
        ObjectKey: filePath,
      },
      exportOptions
    )

    const jobRecord: MigrateJobDto = {
      filePath,
      projectId,
      collectionName,
      jobId: JobId,
      jobType: 'export',
      createTime: Date.now(),
    }

    // 添加记录
    return this.collection().add(jobRecord)
  }

  /**
   * 将 json lines 文件转换成 json 文件
   */
  @Post('parseJsonLinesFile')
  async parseJsonLinesFile(@Body() body: { fileUrl: string }) {
    const { fileUrl } = body
    const app = getCloudBaseApp()

    const id = randomId()
    const tempFilePath = `/tmp/${id}-tmp.json`

    // 下载文件
    const res = await this.httpService
      .get(fileUrl, {
        responseType: 'stream',
      })
      .toPromise()
    res.data.pipe(fs.createWriteStream(tempFilePath))

    // 检查文件大小
    const info = fs.statSync(tempFilePath)
    // 50MB
    const MAX_SIZE = 50 * 1024 * 1024

    if (info.size > MAX_SIZE) {
      throw new CmsException(ErrorCode.UnsupportedOperation, '文件大小超过 50M，无法导出')
    }

    // 读取解析文件
    const tempUploadFilePath = `/tmp/${id}.json`
    await new Promise<void>((resolve, reject) => {
      try {
        const rl = readline.createInterface({
          input: fs.createReadStream(tempFilePath, { encoding: 'utf8' }),
        })

        const data = []

        rl.on('line', (l) => {
          data.push(JSON.parse(l))
        })

        rl.on('close', () => {
          fs.writeFileSync(tempUploadFilePath, JSON.stringify(data))
          resolve()
        })
      } catch (error) {
        reject(new Error(`文件解析异常: ${error.message}`))
      }
    })

    const { fileID } = await app.uploadFile({
      cloudPath: `cloudbase-cms/data-export/${randomId(32)}-export-format.json`,
      fileContent: fs.createReadStream(tempUploadFilePath),
    })

    return {
      data: fileID,
    }
  }

  collection(collection = Collection.DataMigrateTasks) {
    return this.cloudbaseService.collection(collection)
  }
}
