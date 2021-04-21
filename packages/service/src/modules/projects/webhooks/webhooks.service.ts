import _ from 'lodash'
import axios from 'axios'
import config from '@/config'
import util from 'util'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { Collection } from '@/constants'
import { callFunction } from '@/utils'
import { Webhook } from './type'

export interface WebhookCallOptions {
  // 项目 ID
  projectId: string

  // 内容集合名
  resource: string

  // 行为
  action: string

  // 响应数据
  actionRes: any

  // content action 选项
  actionOptions?: {
    page?: number
    pageSize?: number
    filter?: {
      _id?: string
      ids?: string[]
      [key: string]: any
    }
    fuzzyFilter?: {
      [key: string]: any
    }
    sort?: {
      [key: string]: 'ascend' | 'descend'
    }
    payload?: Record<string, any>
  }

  user: RequestUser
}

interface WebhookLog extends Webhook {
  status: 'success' | 'fail'

  // 执行时间
  timestamp: number
}

@Injectable()
export class WebhooksService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  // 处理 webhook
  async callWebhook(options: WebhookCallOptions) {
    const { projectId, resource, action, actionRes, actionOptions, user } = options

    const $ = this.cloudbaseService.db.command
    const webhookEvent = action.replace('One', '').replace('Many', '')

    // 查询满足的 webhook
    let { data: webhooks } = await this.cloudbaseService
      .collection(Collection.Webhooks)
      .where({
        projectId,
        // TODO: SDK 解析 Bug，待修复
        // event: $.or($.elemMatch($.eq('*')), $.elemMatch($.eq(webhookEvent))),
        collections: $.or(
          $.elemMatch($.eq('*')),
          $.elemMatch({
            collectionName: resource,
          })
        ),
      })
      .limit(1000)
      .get()

    // 手动过滤
    webhooks = webhooks.filter((_) => _.event?.includes('*') || _.event?.includes(webhookEvent))

    if (!webhooks?.length) {
      console.info('没有符合条件的 Webhook')
      return
    }

    console.info('Webhook 获取成功', webhooks)

    /**
     * 批量执行
     */
    const executions = webhooks.map(async (webhook: Webhook) => {
      const { type, functionName, method, url, headers = [] } = webhook

      const webhookLogInfo: any = _.omit(webhook, ['_id', '_createTime', '_updateTime'])
      // 触发用户信息
      webhookLogInfo.triggerUser = user

      // webhook 发送内容
      const webhookPayload = {
        action,
        actionRes,
        collection: resource,
        payload: actionOptions?.payload,
        actionFilter: actionOptions?.filter,
      }

      try {
        // 云函数
        if (type === 'function') {
          const { result } = await callFunction(functionName, {
            ...webhookPayload,
            source: 'CMS_WEBHOOK_FUNCTION',
          })

          // 添加 webhook 执行 log
          await this.collection(Collection.WebhookLog).add({
            ...webhookLogInfo,
            action,
            status: 'success',
            collection: resource,
            timestamp: Date.now(),
            result: util.format(result),
          })
        } else {
          // http 请求
          // 拼接请求 Header
          const httpHeaders = headers?.reduce((prev, cur) => {
            const { key, value } = cur

            if (key in prev) {
              const oldValue = prev[key]
              if (Array.isArray(oldValue)) {
                prev[key].push(value)
              } else {
                prev[key] = typeof oldValue === 'undefined' ? [value] : [oldValue, value]
              }
            } else {
              prev[key] = value
            }

            return prev
          }, {})

          const { data } = await axios({
            method,
            url,
            headers: httpHeaders,
            data: {
              ...webhookPayload,
              source: 'CMS_WEBHOOK_HTTP',
            },
            timeout: config.webhookTimeout,
          })

          // 添加 webhook 执行 log
          await this.collection(Collection.WebhookLog).add({
            ...webhookLogInfo,
            action,
            status: 'success',
            collection: resource,
            timestamp: Date.now(),
            result: util.format(data),
          })
        }
      } catch (error) {
        // 触发错误
        console.info('webhook 调用错误', error)

        // 添加 webhook 执行 log
        await this.collection(Collection.WebhookLog).add({
          ...webhookLogInfo,
          action,
          status: 'error',
          collection: resource,
          timestamp: Date.now(),
          result: util.format(error) || '触发 Webhook 异常',
        })
      }
    })

    // TODO: 隔离处理，不影响请求
    await Promise.all(executions)

    console.info('Webhook 触发成功！')
  }

  // 简写
  private collection(collection: string) {
    return this.cloudbaseService.collection(collection)
  }
}
