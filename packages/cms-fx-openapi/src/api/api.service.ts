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
} from '@/utils'
import { CmsException } from '@/common'

dayjs.locale('zh-cn')

@Injectable()
export class ApiService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  /**
   * 通过号码列表，发送短信
   * @param taskId
   */
  async sendSmsByNumbers(taskId: string) {
    const wxCloudApp = getWxCloudApp()
    const { ENV } = wxCloudApp.getWXContext()

    try {
      // 查询任务记录
      const {
        data: [task],
      } = await this.collection(Collection.MessageTasks).doc(taskId).get()

      if (!task) {
        return {
          error: {
            code: 'TASK_NOT_FOUND',
            message: '发送短信的任务未找到',
          },
        }
      }

      // 获取号码列表，补充 +86 前缀
      const phoneNumberList = task.phoneNumberList.map((num) =>
        num.match(/^\+86/) ? num : `+86${num}`
      )

      const activityPath = process.env.TCB_CMS ? 'tcb-cms-activities' : 'cms-activities'

      // 下发短信
      const result = await wxCloudApp.openapi.cloudbase.sendSms({
        env: ENV,
        phoneNumberList,
        content: task.content,
        path: `/${activityPath}/index.html?source=_cms_sms_&activityId=${task.activityId}`,
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
      await this.collection(Collection.MessageTasks)
        .doc(taskId)
        .update({
          status: 'send_fail',
          error: err.message || err.errMsg,
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
          message = err.message || err.errMsg
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
  async sendSmsByFile(fileUri: string, taskId: string) {
    const wxCloudApp = getWxCloudApp()
    const envId = getEnvIdString()

    // 查询任务记录
    const {
      data: [task],
    } = await this.collection(Collection.MessageTasks).doc(taskId).get()

    if (!task) {
      return {
        error: {
          code: 'TASK_NOT_FOUND',
          message: '发送短信的任务未找到',
        },
      }
    }

    // 创建发送任务
    const result = await wxCloudApp.openapi.cloudbase.createSendSmsTask({
      env: envId,
      file_url: fileUri,
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
    let fileContentString

    try {
      console.time('download')
      let { fileContent } = await app.downloadFile({
        fileID: fileId,
      })
      console.timeEnd('download')
      // buffer 转 string
      fileContentString = fileContent.toString('utf-8')
    } catch (e) {
      throw new CmsException('DOWNLOAD_ERROR', `下载文件失败：${e.message}`)
    }

    // 读取文件内容
    let { data, errors }: { data: string[][]; errors: any[] } = Papa.parse(fileContentString)
    // 过滤空行
    data = data.filter((_) => _?.length && _.filter((_) => _?.length)?.length)

    // 解析文件错误
    if (errors?.length) {
      const message = errors.map((_) => _.message).join('; ')
      throw new CmsException('PARSE_ERROR', `解析 CSV 文件异常：${message}`)
    }

    // 判断首行是否为标题，并减去首行的标题
    const firstLine = data[0]
    const isFirstLineTitle = firstLine[0]?.length ? !/\d/.test(firstLine[0]) : false
    // 发送号码总量
    const total = isFirstLineTitle ? data?.length - 1 : data?.length

    // 余额不足，不继续上传文件
    if (total > amount || amount <= 0) {
      throw new CmsException(
        'ResourceInsufficient',
        `短信配置不足，无法创建发送任务：可用余量：${amount}，短信总数：${total}`
      )
    }

    const jumpPath = this.getSmsPagePath(activityId)

    // 如果首行是标题，则删除首行
    if (isFirstLineTitle) {
      data.splice(0, 1)
    }

    // 填充跳转路径
    const supplementData = data.map((line: string[]) => {
      line[2] = jumpPath
      return line
    })

    // 将数据转换成 CSV
    const supplementCSV = Papa.unparse(supplementData)

    // 上传文件
    const fileName = fileId.split('/').pop()
    const fileUri = await this.uploadFile(Buffer.from(supplementCSV), fileName)

    // 返回总数量
    return {
      total,
      fileUri,
    }
  }

  /**
   * 上传号码包文件到后台
   */
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
