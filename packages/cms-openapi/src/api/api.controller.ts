import _ from 'lodash'
import { IsNotEmpty } from 'class-validator'
import { Post, Body, UseGuards, Controller } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { PermissionGuard } from '@/guards'
import { getWxCloudApp } from '@/utils'
import { ApiService } from './api.service'

class MessageBody {
  @IsNotEmpty()
  fileId: string

  @IsNotEmpty()
  activityId: string
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
  async createSendSms(@Body() body: { taskId: string }) {
    console.log('使用 OpenAPI 发送短信')
    const { taskId } = body
    return this.apiService.sendSms(taskId)
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
   * 分析短信 CSV 文件
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('getSmsTaskAnalysisData')
  async getSmsTaskAnalysisData(@Body() body: MessageBody) {
    const { fileId, activityId } = body

    // 获取短信用量
    const usage = await this.apiService.getSmsUsage()

    // 剩余短信量
    const amount = usage.Quota - usage.Usage

    // 获取 excel 文件号码数量
    const analysis = await this.apiService.analysisAndUploadCSV(fileId, activityId, amount)

    return { usage, ...analysis }
  }

  /**
   * 使用号码包文件发送短信
   */
  @UseGuards(PermissionGuard('operation'))
  @Post('createSendSmsTaskByFile')
  async createSendSmsTaskByFile(@Body() body: { fileUri: string }) {
    const { fileUri } = body

    return { ok: '1' }
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
