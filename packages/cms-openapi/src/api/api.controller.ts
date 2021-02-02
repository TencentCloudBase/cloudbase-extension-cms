import _ from 'lodash'
import { Post, Body, UseGuards, Controller } from '@nestjs/common'
import { CloudBaseService } from '@/services'

import { PermissionGuard } from '@/guards'
import { getWxCloudApp } from '@/utils'
import { ApiService } from './api.service'

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
  async createSendSmsTask(@Body() body: { taskId: string }) {
    console.log('使用 OpenAPI 发送短信')
    const { taskId } = body
    return this.apiService.sendSms(taskId)
  }

  // 获取访问数据
  @UseGuards(PermissionGuard('operation'))
  @Post('getAnalyticsData')
  async getAnalyticsData(@Body() body: { activityId: string; metricName?: string }) {
    const { activityId, metricName } = body

    const data = await this.apiService.getStatistics({
      activityId,
    })

    return { data }
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
