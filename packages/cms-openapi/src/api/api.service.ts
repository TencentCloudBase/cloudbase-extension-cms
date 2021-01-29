import _ from 'lodash'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { Collection } from '@/constants'
import { getEnvIdString, getWxCloudApp } from '@/utils'

dayjs.locale('zh-cn')

// 数据不存在
const emptyStatistic = {
  // 概览数据
  overviewCount: {
    phoneNumberCount: 0,
    webPageViewCount: 0,
    miniappViewCount: 0,
  },
  // h5 访问用户渠道
  webPageViewSource: -1,
  miniappViewSource: -1,
  messageConversion: -1,
}

// 默认渠道
const DefaultChannels = [
  {
    value: '_cms_sms_',
    label: '短信',
  },
  {
    value: 'zhihu',
    label: '知乎',
  },
  {
    value: 'qqvideo',
    label: '腾讯视频',
  },
  {
    value: 'wecom',
    label: '企业微信',
  },
  {
    value: 'qq',
    label: 'QQ',
  },
]

@Injectable()
export class ApiService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  /**
   *
   * @param taskId
   */
  async sendSms(taskId: string) {
    const wxCloudApp = getWxCloudApp()
    const { ENV } = wxCloudApp.getWXContext()

    try {
      // 查询任务记录
      const {
        data: [task],
      } = await this.collection(Collection.MessageTasks).doc(taskId).get()

      if (!task) {
        return {
          code: 'TASK_NOT_FOUND',
          message: '发送短信的任务未找到',
        }
      }

      console.log(task)

      // 获取号码列表，补充 +86 前缀
      const phoneNumberList = task.phoneNumberList.map((num) =>
        num.match(/^\+86/) ? num : `+86${num}`
      )

      console.log(phoneNumberList)

      // 下发短信
      const result = await wxCloudApp.openapi.cloudbase.sendSms({
        env: ENV,
        phoneNumberList,
        content: task.content,
        path: `/cms-activities/index.html?activityId=${task.activityId}&source=_cms_sms_`,
      })

      // 上报短信下发任务
      try {
        await this.reportMessageTask({
          taskId,
          phoneCount: String(phoneNumberList.length),
          activityId: task.activityId,
        })
        console.log('短信下发任务，上报成功', task.activityId)
      } catch (error) {
        console.log('上报错误', error)
      }

      // 发送结果列表
      const { sendStatusList } = result

      // 更新任务记录
      await this.collection(Collection.MessageTasks).doc(taskId).update({
        status: 'send_success',
        sendStatusList,
      })

      console.log('下发结果', result)

      return result
    } catch (err) {
      console.log('下发短信失败', err)

      // 更新任务记录
      await this.collection(Collection.MessageTasks).doc(taskId).update({
        status: 'send_fail',
        error: err.message,
      })

      let message

      switch (err.errCode) {
        case -1:
          message = '系统繁忙，此时请开发者稍候再试'
          break
        case -601027:
          message = '无效的环境'
          break
        case -601028:
          message = '该环境没有开通静态网站'
          break
        case -601029:
          message = '信息长度过长'
          break
        case -601030:
          message = '信息含有违法违规内容'
          break
        case -601031:
          message = '无效的 Path'
          break
        case -601032:
          message = '小程序昵称不能为空'
          break
        case -601033:
          message = '仅支持非个人主体小程序'
          break
        default:
          message = err.message
      }

      return {
        error: {
          message,
          code: err.errCode,
        },
      }
    }
  }

  /**
   * 上报短信下发任务
   */
  async reportMessageTask(
    event: {
      taskId?: string
      phoneCount?: string
      activityId?: string
    } = {}
  ) {
    const wxCloudApp = getWxCloudApp()
    const { ENV } = wxCloudApp.getWXContext()

    const { taskId, phoneCount, activityId } = event

    console.log('上报短信下发任务', phoneCount)

    // TODO: update
    // @ts-ignore
    await wxCloudApp.openapi({ convertCase: false }).cloudbase.report({
      reportAction: 'sendSmsTask', // 下发短信上报
      activityId, // 活动 ID
      taskId, // 任务 ID
      phoneCount, // 手机数量
      envId: ENV, // 环境 ID
    })
  }

  /**
   * 从 openapi 获取数据
   */
  async getStatistics(options: { activityId: string }) {
    const { activityId } = options
    const wxCloudApp = getWxCloudApp()
    const envId = await getEnvIdString()

    const beginDate = dayjs().subtract(1, 'day').startOf('day').unix()
    const endDate = dayjs().subtract(1, 'day').endOf('day').unix()

    const {
      data: [setting],
    } = await this.cloudbaseService.collection(Collection.Settings).where({}).get()
    let activityChannels: {
      value: string
      label: string
    }[] = setting?.activityChannels || []

    try {
      const query = {
        action: 'sms',
        beginDate,
        endDate,
        pageOffset: 0,
        pageLimit: 1000,
        condition: {
          envId,
          activityId,
          // byChannelId: '0', // 概览：填"0"；饼图：填"1"
          // channelId: '_cms_sms_', // 漏斗图：填"_cms_sms_"
        },
      }

      const res = await wxCloudApp.openapi.cloudbase.getStatistics(query)

      const {
        errCode,
        errMsg,
        dataColumn,
        dataValue,
      }: {
        errCode: number
        errMsg: string
        dataColumn: { colId: string; colName: string; colDataType: string }[]
        dataValue: { dataValue: string[] }[]
      } = res

      // 数据不存在
      if (!dataValue?.length) {
        return emptyStatistic
      }

      // 全部渠道数据的 index
      const channelIdIndex = dataColumn.findIndex((_) => _.colId === 'channel_id')

      // 全渠道数据
      const allChannelData = dataValue.find((_) => _.dataValue[channelIdIndex] === 'all')

      // 获取指标的数据
      const getMetricValue = (metricName: string, data?: { dataValue: string[] }) => {
        const index = dataColumn.findIndex((_) => _.colId === metricName)

        if (!index) {
          return -1
        }

        if (data) return Number(data.dataValue[index]) || 0

        return Number(allChannelData.dataValue[index]) || 0
      }

      // 获取渠道数据占比
      const getChannelSource = (metricName: string) => {
        const metricIndex = dataColumn.findIndex((_) => _.colId === metricName)

        // 过滤掉全部渠道的数据，依次获取每个渠道的数据，聚合为最终数据
        return dataValue
          .filter((_) => _.dataValue[channelIdIndex] !== 'all')
          .map((item) => {
            // 此渠道的名称
            const channelId = item.dataValue[channelIdIndex]
            // 此渠道在设置中的名称
            const channel = DefaultChannels.concat(activityChannels).find(
              (channel) => channel?.value === channelId
            )

            let label = channel?.label || channelId

            if (label === '-') {
              label = '未知渠道'
            }

            return {
              label,
              value: Number(item.dataValue[metricIndex]),
            }
          })
      }

      // 短信渠道数据
      const smsChannelData = dataValue.find((_) => _.dataValue[channelIdIndex] === '_cms_sms_')
      // 短信转换率
      const messageConversion = [
        { number: getMetricValue('sms_send_uercnt', smsChannelData), stage: '短信投放号码数' },
        { number: getMetricValue('h5_open_uercnt', smsChannelData), stage: 'H5 访问用户数' },
        { number: getMetricValue('jump_wxapp_uercnt', smsChannelData), stage: '跳转小程序用户数' },
      ]

      const data = {
        // 概览数据
        overviewCount: {
          phoneNumberCount: getMetricValue('sms_send_uercnt'),
          webPageViewCount: getMetricValue('h5_open_uercnt'),
          miniappViewCount: getMetricValue('jump_wxapp_uercnt'),
        },
        // h5 访问用户渠道
        webPageViewSource: getChannelSource('h5_open_uercnt'),
        miniappViewSource: getChannelSource('jump_wxapp_uercnt'),
        messageConversion,
      }

      console.log(data)

      return data
    } catch (e) {
      console.log('查询数据异常', e)
      // 查不到数据
      if (e.errCode === 10011) {
        return emptyStatistic
      }

      throw e
    }
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
