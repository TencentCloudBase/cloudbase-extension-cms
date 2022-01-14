import _ from 'lodash'
import { IsNotEmpty } from 'class-validator'
import { Post, Body, UseGuards, Controller, Request } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { PermissionGuard } from '@/guards'
import { Collection } from '@/constants'
import { getCloudBaseApp, getEnvIdString, getWxCloudApp } from '@/utils'
import { ApiService } from './api.service'

class SmsFileBody {
  @IsNotEmpty()
  fileId: string

  @IsNotEmpty()
  activityId: string

  @IsNotEmpty()
  projectId: string
}

@Controller('/api')
export class ApiController {
  constructor(
    private readonly cloudbaseService: CloudBaseService,
    private readonly apiService: ApiService
  ) {}

  /**
   * 获取小程序的名称、主体等信息
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('getAppBasicInfo')
  async getAppBasicInfo() {
    try {
      const wxCloudApp = getWxCloudApp()
      const res = await wxCloudApp.openapi.auth.getBasicInfo()
      console.log('小程序信息', res)
      return res
    } catch (e) {
      return {
        error: {
          message: e.message,
          code: e.errCode,
        },
      }
    }
  }

  /**
   * 创建下发短信任务
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('sendSms')
  async createSendSmsTask(@Body() body: { taskId: string; useShortname: boolean }) {
    console.log('使用 OpenAPI 发送短信')
    const { taskId, useShortname = false } = body
    return this.apiService.sendSmsByNumbers(taskId, useShortname)
  }

  /**
   * 获取访问数据
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('getAnalyticsData')
  async getAnalyticsData(@Body() body: { activityId: string; metricName?: string }) {
    const { activityId, metricName } = body

    const data = await this.apiService.getStatistics({
      activityId,
    })

    return { data }
  }

  /**
   * 获取实时访问数据
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('getRealtimeAnalyticsData')
  async getRealtimeAnalyticsData(
    @Body() body: { activityId: string; startTime: number; endTime: number; channelId: string }
  ) {
    const data = await this.apiService.getRealtimeStatistics(body)
    return { data }
  }

  /**
   * 分析短信 CSV 文件
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('getSmsFileAnalysisData')
  async getSmsFileAnalysisData(@Body() body: SmsFileBody, @Request() req: IRequest) {
    const { fileId, activityId, projectId } = body
    const app = getCloudBaseApp()

    try {
      // 获取短信用量
      const usage = await this.apiService.getSmsUsage()

      // 剩余短信量
      const amount = usage.Quota - usage.Usage

      // 获取 excel 文件号码数量
      const analysis = await this.apiService.analysisAndUploadCSV(fileId, activityId, amount)

      // 写入 task 记录
      const taskRes = await this.collection(Collection.MessageTasks).add({
        // 短信内容
        content: '',
        projectId,
        // 关联的活动 ID
        activityId,
        // 创建用户
        phoneNumberList: [],
        // 号码包文件
        fileUri: analysis.fileUri,
        // 创建用户名
        createdUser: req.cmsUser,
        // 号码包文件已上传
        status: 'uploaded',
        // 号码总量
        total: analysis.total,
        createTime: Date.now(),
      })

      return { usage, taskId: taskRes.id, ...analysis }
    } catch (error) {
      // 删除文件
      await app.deleteFile({ fileList: [fileId] })
      throw error
    }
  }

  /**
   * 使用号码包文件发送短信
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('createSendSmsTaskByFile')
  async createSendSmsTaskByFile(
    @Body() body: { fileUri: string; taskId: string; useShortname: boolean }
  ) {
    const { fileUri, taskId, useShortname = false } = body

    return this.apiService.sendSmsByFile(fileUri, taskId, useShortname)
  }

  /**
   * 获取小程序 URL Link，适用于短信、邮件、网页、微信内等拉起小程序的业务场景
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('generateUrlLink')
  async generateUrlLink(
    @Body() body: { path: string; query: string; appPath: string; appPathQuery: string }
  ) {
    const { path, query, appPath, appPathQuery } = body

    const envId = getEnvIdString()
    const wxCloudApp = getWxCloudApp()

    return wxCloudApp.openapi.urllink.generate({
      path: appPath,
      query: appPathQuery,
      isExpire: true,
      expireType: 1,
      expireInterval: 30,
      cloudBase: {
        path,
        query,
        env: envId,
        domain: '',
      },
    })
  }

  @UseGuards(PermissionGuard('operation'))
  @Post('getTemplateSign')
  async getTemplateSign() {
    return this.apiService.getCustomTemplateSign()
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
