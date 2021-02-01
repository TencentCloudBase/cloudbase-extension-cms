import _ from 'lodash'
import {
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { IsNotEmpty, MaxLength } from 'class-validator'
import { getEnvIdString, dateToUnixTimestampInMs, randomId } from '@/utils'
import { Collection } from '@/constants'
import { OperationService } from './operation.service'

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

  @IsNotEmpty()
  createdUser: any
}

class EnableServiceBody {
  @IsNotEmpty()
  miniappName: string

  @IsNotEmpty()
  miniappID: string

  @IsNotEmpty()
  miniappOriginalID: string
}

@UseGuards(PermissionGuard('operation'))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/operation')
export class OperationController {
  constructor(
    public readonly cloudbaseService: CloudBaseService,
    private readonly operationService: OperationService
  ) {}

  /**
   * 开启未登录
   */
  @Post('enableNonLogin')
  async createNonLogin() {
    // 开启未登录
    await this.operationService.enableNonLogin()
    // 修改安全规则
    await this.operationService.updateSecurityRules()
  }

  /**
   * 开启营销工具
   */
  @Post('enableOperationService')
  async createOperationService(@Body() payload: EnableServiceBody) {
    const { data: settings } = await this.collection(Collection.Settings).where({}).get()

    const appConfig = {
      ...payload,
      enableOperation: true,
    }

    // 生成活动模板
    await this.operationService.generateTemplate(appConfig)

    // setting 为空，直接添加数据
    if (!settings?.length) {
      await this.collection(Collection.Settings).add(appConfig)
    } else {
      // 存储小程序信息
      await this.collection(Collection.Settings).where({}).update(appConfig)
    }

    // 添加默认活动
    const {
      data: [record],
    } = await this.collection(Collection.MessageActivity).where({}).get()

    // 添加默认活动
    if (!record) {
      const now = Date.now()
      await this.collection(Collection.MessageActivity).add({
        activityName: '营销demo',
        endTime: 1893456000000,
        isActivityOpen: true,
        startTime: 1610353674000,
        _createTime: now,
        _updateTime: now,
      })
    }
  }

  /**
   * 创建发送短信的任务
   */
  @Post('createBatchTask')
  async createBatchTask(@Param('projectId') projectId, @Body() body: MessageTaskBody) {
    const envId = getEnvIdString()
    const { content, phoneNumberList, activityId, createdUser } = body

    // 写入 task 记录
    const taskRes = await this.collection(Collection.MessageTasks).add({
      // 短信内容
      content,
      projectId,
      // 关联的活动 ID
      activityId,
      // 创建用户
      createdUser,
      phoneNumberList,
      // 已创建
      status: 'created',
      total: phoneNumberList.length,
      createTime: dateToUnixTimestampInMs(),
    })

    const taskId = taskRes.id
    const token = randomId(128)

    // 生成一个 token，用于下发短信任务的鉴权
    await this.collection(Collection.MessageAuthToken).add({
      // 环境 id，此 token 仅能触发此环境的任务
      envId,
      // 验证 token
      token,
      // 任务 Id
      taskId,
      type: 'smstask',
      // 创建时间
      createTime: Date.now(),
    })

    return {
      taskId,
      token,
    }
  }

  /**
   * 查询活动分析数据
   */
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

  collection(collection = Collection.DataMigrateTasks) {
    return this.cloudbaseService.collection(collection)
  }
}
