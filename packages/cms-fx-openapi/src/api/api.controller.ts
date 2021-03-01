import _ from 'lodash'
import { Post, Body, Controller } from '@nestjs/common'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { CloudBaseService } from '@/services'
import { Collection } from '@/constants'
import { ApiService } from './api.service'

class ActivityQueryBody {
  @IsOptional()
  @IsString()
  activityName

  @IsOptional()
  @IsBoolean()
  activityEnable

  @IsOptional()
  @IsString()
  pagePath

  @IsOptional()
  @IsNumber()
  page

  @IsOptional()
  @IsNumber()
  pageSize
}

class TaskQueryBody {
  @IsOptional()
  @IsString()
  taskId

  @IsOptional()
  @IsNumber()
  page

  @IsOptional()
  @IsNumber()
  pageSize
}

class MessageTaskBody {
  @IsNotEmpty()
  content: string

  @IsNotEmpty()
  @MaxLength(1000, {
    each: true,
  })
  phoneNumberList: string[]

  @IsNotEmpty()
  activityId: string

  createdUser: any
}

class SmsFileBody {
  @IsNotEmpty()
  activityId: string

  @IsNotEmpty()
  fileId: string
}

@Controller('/api')
export class ApiController {
  constructor(
    private readonly cloudbaseService: CloudBaseService,
    private readonly apiService: ApiService
  ) {}

  /**
   * 查询活动数据
   */
  @Post('queryActivities')
  async queryActivities(@Body() payload: ActivityQueryBody) {
    const { activityName, activityEnable, pagePath, page = 1, pageSize = 10 } = payload

    const query: any = {}
    const { db } = this.cloudbaseService

    if ('activityName' in payload) {
      query.activityName = db.RegExp({
        options: 'ig',
        regexp: String(activityName),
      })
    }

    if ('pagePath' in payload) {
      query.pagePath = db.RegExp({
        options: 'ig',
        regexp: String(pagePath),
      })
    }

    if ('activityEnable' in payload) {
      query.activityEnable = activityEnable
    }

    const queryRef = this.collection(Collection.MessageActivity).where(query)

    const totalRes = await queryRef.count()

    const res = await queryRef
      .skip(Number(page - 1) * Number(pageSize))
      .limit(pageSize)
      .get()

    return {
      ...res,
      total: totalRes.total,
    }
  }

  /**
   * 查询短信任务信息
   */
  @Post('querySmsTasks')
  async querySmsTasks(@Body() payload: TaskQueryBody) {
    const { taskId, page = 1, pageSize = 10 } = payload

    const query: any = {}

    if ('taskId' in payload) {
      query._id = taskId
    }

    const queryRef = this.collection(Collection.MessageTasks).where(query)

    const totalRes = await queryRef.count()

    const res = await queryRef
      .skip(Number(page - 1) * Number(pageSize))
      .limit(pageSize)
      .get()

    return {
      ...res,
      total: totalRes.total,
    }
  }

  /**
   * 创建下发短信任务
   */
  @Post('sendSms')
  async sendSms(@Body() body: MessageTaskBody) {
    const { content, phoneNumberList, activityId } = body

    // 写入 task 记录
    const taskRes = await this.collection(Collection.MessageTasks).add({
      // 短信内容
      content,
      // 关联的活动 ID
      activityId,
      // 号码列表
      phoneNumberList,
      // 已创建
      status: 'created',
      total: phoneNumberList.length,
      // 创建用户
      createdUser: {
        username: 'Admin（HTTP API）',
      },
      createTime: Date.now(),
    })

    return this.apiService.sendSmsByNumbers(taskRes.id)
  }

  /**
   * 使用号码包文件发送短信
   */
  @Post('createSmsTask')
  async createSmsTask(@Body() body: SmsFileBody) {
    const { activityId } = body

    // 写入 task 记录
    const taskRes = await this.collection(Collection.MessageTasks).add({
      // 关联的活动 ID
      activityId,
      // 短信内容
      content: '',
      // 创建用户
      phoneNumberList: [],
      // 创建用户名
      createdUser: {
        username: 'Admin（HTTP API）',
      },
      // 创建初始任务
      status: 'created',
      createTime: Date.now(),
    })

    // 异步执行任务
    this.execAsyncTask(taskRes.id, body)

    return { taskId: taskRes.id }
  }

  private async execAsyncTask(taskId: string, data: SmsFileBody) {
    const { fileId, activityId } = data
    // 获取短信用量
    const usage = await this.apiService.getSmsUsage()

    // 剩余短信量
    const amount = usage.Quota - usage.Usage

    // 获取 excel 文件号码数量
    const analysis = await this.apiService.analysisAndUploadCSV(fileId, activityId, amount)

    const fileUri = analysis.fileUri

    await this.collection(Collection.MessageTasks).doc(taskId).update({
      // 号码包文件
      fileUri,
      // 号码包文件已上传
      status: 'uploaded',
      // 号码总量
      total: analysis.total,
    })

    return this.apiService.sendSmsByFile(fileUri, taskId)
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
