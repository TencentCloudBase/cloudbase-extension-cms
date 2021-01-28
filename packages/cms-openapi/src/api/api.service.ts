import _ from 'lodash'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { Collection } from '@/constants'
import { getWxCloudApp } from '@/utils'

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

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
