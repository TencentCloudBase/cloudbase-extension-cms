import _ from 'lodash'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import Axios from 'axios'
import Papa from 'papaparse'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { Collection } from '@/constants'
import {
  base64,
  getCloudBaseApp,
  getCloudBaseManager,
  getEnvIdString,
  getWxCloudApp,
  md5Base64,
  unixToDateString,
} from '@/utils'
import { CmsException } from '@/common'

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
   * 通过号码列表，发送短信
   * @param taskId
   */
  async sendSmsByNumbers(taskId: string, useShortname: boolean) {
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

      // const activityPath = process.env.TCB_CMS ? 'tcb-cms-activities' : 'cms-activities'

      // 查询活动信息，获取小程序 path 和 query
      const {
        data: [activity],
      } = await this.collection(Collection.MessageActivity).doc(task.activityId).get()

      // 生成短链
      // let { urlLink } = await wxCloudApp.openapi.urllink.generate({
      //   // 小程序 query path
      //   path: activity?.appPath || '',
      //   query: activity?.appPathQuery || '',
      //   isExpire: true,
      //   expireType: 1,
      //   expireInterval: 30,
      //   cloudBase: {
      //     path: `/${activityPath}/index.html`,
      //     query: `source=_cms_sms_&activityId=${task.activityId}`,
      //     env: ENV,
      //     domain: '',
      //   },
      // })
      // urlLink = urlLink.replace(/https:\/\/|http:\/\//, '')

      const jumpPath = this.getSmsPagePath(task.activityId)

      // 下发短信
      const result = await wxCloudApp.openapi.cloudbase.sendSms({
        env: ENV,
        phoneNumberList,

        content: task.content,
        path: jumpPath,

        // https 的链接才有效
        // urlLink: urlLink,
        // templateParamList: [task.content],
        // templateId: process.env.SMS_TEMPLATE_ID || '844110',
        // use_short_name: !!useShortname,
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

      // 发送结果列表、结果查看 ID
      const { sendStatusList, queryId } = result

      // 更新任务记录
      await this.collection(Collection.MessageTasks).doc(taskId).update({
        queryId,
        sendStatusList,
        status: 'send_success',
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
   * 通过号码包文件创建发送短信的任务
   */
  async sendSmsByFile(fileUri: string, taskId: string, useShortname: boolean) {
    const wxCloudApp = getWxCloudApp()
    const envId = getEnvIdString()

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

    // 创建发送任务
    // const result = await wxCloudApp.openapi.cloudbase.createSendSmsTask({
    //   env: envId,
    //   is_url_link: true,
    //   file_url: fileUri,
    //   template_id: process.env.SMS_TEMPLATE_ID || '844110',
    //   use_short_name: useShortname,
    // })
    const result = await wxCloudApp.openapi.cloudbase.createSendSmsTask({
      env: envId,
      // is_url_link: true,
      fileUrl: fileUri,
      templateId: process.env.SMS_TEMPLATE_ID || '844110',
      useShortName: useShortname,
    })

    console.log('发送结果', result)

    // 上报数据
    await this.reportMessageTask({
      taskId,
      phoneCount: task.total,
      activityId: task.activityId,
    })

    // 更新任务记录
    await this.collection(Collection.MessageTasks).doc(taskId).update({
      queryId: result.queryId,
      status: 'send_success',
    })
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

    console.log('上报短信下发任务', event)

    // TODO: update
    // @ts-ignore
    await wxCloudApp.openapi({ convertCase: false }).cloudbase.report({
      reportAction: 'sendSmsTask', // 下发短信上报
      activityId, // 活动 ID
      taskId, // 任务 ID
      envId: ENV, // 环境 ID
      // 号码数只支持数字
      phoneCount: String(phoneCount), // 手机数量
    })
  }

  /**
   * 从 openapi 获取分析数据
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

  /**
   * 查询实时统计数据
   */
  async getRealtimeStatistics(options: {
    activityId: string
    startTime: number
    endTime: number
    channelId: string
  }) {
    const { activityId, startTime, endTime, channelId = '_cms_sms_' } = options
    const wxCloudApp = getWxCloudApp()
    const envId = await getEnvIdString()

    const getQuery = (type: 'h5' | 'wxapp') => ({
      action: 'realTime',
      beginDate: startTime,
      endDate: endTime,
      condition: {
        envId,
        activityId,
        channelId,
        act_type: type,
      },
    })

    let webPageViewUsers = []
    let miniappViewUsers = []

    // 补充数据
    const translateData = (data, type: 'webPageView' | 'miniappView') => {
      const fullData: {
        time: string
        value: number
        type: 'webPageView' | 'miniappView'
      }[] = []

      for (let i = Number(startTime); i <= endTime; i = i + 300) {
        // 读取时间
        const item = data.find(({ dataValue }) => Number(dataValue[0]) === i)
        let value = 0

        if (item) {
          value = Number(item.dataValue[1]) || 0
        }

        fullData.push({
          type,
          value,
          time: unixToDateString(i),
        })
      }

      return fullData
    }

    try {
      const { dataValue } = await wxCloudApp.openapi.cloudbase.getStatistics(getQuery('h5'))

      webPageViewUsers = translateData(dataValue, 'webPageView')
    } catch (e) {
      if (e.errCode !== 10011) {
        // 抛出错误
        throw e
      }
    }

    try {
      const { dataValue } = await wxCloudApp.openapi.cloudbase.getStatistics(getQuery('wxapp'))

      miniappViewUsers = translateData(dataValue, 'miniappView')
    } catch (e) {
      if (e.errCode !== 10011) {
        // 抛出错误
        throw e
      }
    }

    // 同时存在数据，计算转换率
    const conversionRate: { time: string; percent: number | string }[] = webPageViewUsers.map(
      (v, i) => ({
        time: v.time,
        percent: v.value === 0 ? 0 : Number(miniappViewUsers[i]?.value / v.value).toFixed(4),
      })
    )

    return {
      conversionRate,
      webPageViewUsers,
      miniappViewUsers,
    }
  }

  /**
   * 查询短信用量信息
   */
  async getSmsUsage(): Promise<{
    Usage: number
    EnvId: string
    Quota: number
  }> {
    const envId = getEnvIdString()
    const manager = getCloudBaseManager()

    const { SmsUsageData } = await manager.commonService().call({
      Action: 'DescribeSmsUsage',
      Param: {
        EnvIds: [envId],
      },
    })

    return SmsUsageData[0]
  }

  /**
   * 解析 xlsx 文件
   */
  async analysisAndUploadCSV(fileId: string, activityId: string, amount: number) {
    // 下载文件
    const app = getCloudBaseApp()
    const envId = getEnvIdString()
    const wxCloudApp = getWxCloudApp()

    let { fileContent } = await app.downloadFile({
      fileID: fileId,
    })

    // buffer 转 string
    const fileContentString = fileContent.toString('utf-8')

    // 读取文件内容
    let { data, errors }: { data: string[][]; errors: any[] } = Papa.parse(fileContentString)
    // 过滤空行
    data = data.filter((_) => _?.length && _.filter((_) => _?.length)?.length)

    // 解析文件错误
    if (errors?.length) {
      const message = errors.map((_) => _.message).join('; ')
      // 删除文件
      await app.deleteFile({ fileList: [fileId] })
      throw new CmsException('PARSE_ERROR', `解析 CSV 文件异常：${message}`)
    }

    // 判断首行是否为标题，并减去首行的标题
    const firstLine = data[0]
    const isFirstLineTitle = firstLine[0]?.length ? !/\d/.test(firstLine[0]) : false
    // 发送号码总量
    const total = isFirstLineTitle ? data?.length - 1 : data?.length

    // 余额不足，不继续上传文件
    if (total > amount || amount <= 0) {
      // 删除文件
      await app.deleteFile({ fileList: [fileId] })
      return { total }
    }

    // 生成跳转路径
    // const activityPath = process.env.TCB_CMS ? 'tcb-cms-activities' : 'cms-activities'

    // 查询活动信息，获取小程序 path 和 query
    const {
      data: [activity],
    } = await this.collection(Collection.MessageActivity).doc(activityId).get()

    // 生成短链
    // let { urlLink } = await wxCloudApp.openapi.urllink.generate({
    //   // 小程序 query path
    //   path: activity?.appPath || '',
    //   query: activity?.appPathQuery || '',
    //   isExpire: true,
    //   expireType: 1,
    //   expireInterval: 30,
    //   cloudBase: {
    //     path: `/${activityPath}/index.html`,
    //     query: `source=_cms_sms_&activityId=${activityId}`,
    //     env: envId,
    //     domain: '',
    //   },
    // })
    // urlLink = urlLink.replace(/https:\/\/|http:\/\//, '')

    const jumpPath = this.getSmsPagePath(activityId)

    const supplementData = data.map((line: string[], index) => {
      if (isFirstLineTitle && index === 0) return line
      // 补充 +86
      line[0] = /^\+86/.test(line[0]) ? line[0] : `+86${line[0]}`
      // 替换为新的链接
      // line[2] = line[2] ? line[2] : urlLink
      line[2] = jumpPath
      return line
    })

    // 将数据转换成 CSV
    const supplementCSV = Papa.unparse(supplementData)

    // 上传文件
    const fileName = fileId.split('/').pop()
    const fileUri = await this.uploadFile(Buffer.from(supplementCSV), fileName)

    // 删除文件
    await app.deleteFile({ fileList: [fileId] })

    // 返回总数量
    return {
      total,
      fileUri,
    }
  }

  /**
   * 临时接口，为支持配置用户自定义短信签名（需后台配合设置），目的是帮助绕过短信签名12字限制且小程序简称不能超过6字限制
   * @returns
   */
  async getCustomTemplateSign() {
    const templateSign = process.env.SMS_TEMPLATE_SIGN || ''
    return { templateSign }
  }

  // 获取上传链接
  private async uploadFile(file: Buffer, fileName: string) {
    // 获取上传链接
    const manager = getCloudBaseManager()

    const {
      FilesData,
    }: {
      FilesData: {
        CodeUri: string
        UploadUrl: string
        CustomKey: string
        MaxSize: number
      }[]
    } = await manager.commonService().call({
      Action: 'DescribeExtensionUploadInfo',
      Param: {
        ExtensionFiles: [
          {
            FileType: 'SMS',
            FileName: fileName,
          },
        ],
      },
    })

    const { CodeUri, UploadUrl, CustomKey } = FilesData[0]

    let headers = {
      'Content-Type': 'text/csv',
    }

    if (CustomKey) {
      headers['x-cos-server-side-encryption-customer-algorithm'] = 'AES256'
      headers['x-cos-server-side-encryption-customer-key'] = base64(CustomKey)
      headers['x-cos-server-side-encryption-customer-key-MD5'] = md5Base64(CustomKey)
    }

    await Axios.put(UploadUrl, file, {
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    return CodeUri
  }

  private getSmsPagePath(activityId: string) {
    const activityPath = process.env.TCB_CMS ? 'tcb-cms-activities' : 'cms-activities'
    return `/${activityPath}/index.html?source=_cms_sms_&activityId=${activityId}`
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
