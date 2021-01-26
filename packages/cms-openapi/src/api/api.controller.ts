import _ from 'lodash'
import { Post, Body, UseGuards, Controller } from '@nestjs/common'
import { CloudBaseService } from '@/services'

import { AuthGuard } from '@/guards'
import { Collection } from '@/constants'
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @Post('sendSms')
  async sendSms(@Body() body: { taskId: string }) {
    console.log('使用 OpenAPI 发送短信')
    const { taskId } = body
    return this.apiService.sendSms(taskId)
  }

  // 获取访问数据
  @UseGuards(AuthGuard)
  @Post('getAnalyticsData')
  async getAnalyticsData(@Body() body: { activityId: string; metricName: string }) {
    const { activityId, metricName } = body

    const metricResolvers = {
      // 概览数据
      overviewCount: async () => {
        // 号码总量 phoneNumberCount
        const $ = this.cloudbaseService.db.command

        const {
          data: [ret],
        } = await this.collection(Collection.MessageTasks)
          .aggregate()
          .match({
            activityId,
          })
          .group({
            _id: null,
            count: $.aggregate.sum('$total'),
          })
          .end()

        // TODO: 添加数据
        return {
          phoneNumberCount: ret?.count || 0,
          webPageViewCount: 0,
          miniappViewCount: 0,
        }
      },
      // h5 访问用户渠道
      webPageViewSource: async () => {
        return [
          { value: 20000, label: '短信' },
          { value: 300, label: '知乎' },
          { value: 1000, label: '腾讯视频' },
        ]
      },
      // 小程序访问渠道
      miniappViewSource: async () => {
        return [
          { value: 2000, label: '短信' },
          { value: 3000, label: '知乎' },
          { value: 1000, label: '腾讯视频' },
        ]
      },
      // 短信转化率
      messageConversion: async () => {
        return [
          { number: 10, stage: '短信下发' },
          { number: 8, stage: 'H5 打开用户数' },
          { number: 5, stage: '小程序打开用户数' },
        ]
      },
      // 实时访问数据
      realtimeView: async () => {
        const webPageViewUsers = [
          {
            time: '2019-03',
            value: 350,
            type: 'webPageView',
          },
          {
            time: '2019-04',
            value: 900,
            type: 'webPageView',
          },
          {
            time: '2019-05',
            value: 300,
            type: 'webPageView',
          },
          {
            time: '2019-06',
            value: 450,
            type: 'webPageView',
          },
          {
            time: '2019-07',
            value: 470,
            type: 'webPageView',
          },
        ]

        const miniappViewUsers = [
          {
            time: '2019-03',
            value: 800,
            type: 'miniappView',
          },
          {
            time: '2019-04',
            value: 600,
            type: 'miniappView',
          },
          {
            time: '2019-05',
            value: 400,
            type: 'miniappView',
          },
          {
            time: '2019-06',
            value: 380,
            type: 'miniappView',
          },
          {
            time: '2019-07',
            value: 220,
            type: 'miniappView',
          },
        ]

        const conversionRate = [
          {
            time: '2019-03',
            percent: 0.2,
          },
          {
            time: '2019-04',
            percent: 0.3,
          },
          {
            time: '2019-05',
            percent: 0.4,
          },
          {
            time: '2019-06',
            percent: 0.1,
          },
          {
            time: '2019-07',
            percent: 0.3,
          },
        ]

        return {
          webPageViewUsers,
          miniappViewUsers,
          conversionRate,
        }
      },
    }

    const data = await metricResolvers[metricName]()

    return { data }
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
