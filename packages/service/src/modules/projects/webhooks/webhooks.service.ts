import axios from 'axios'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { Collection } from '@/constants'
import config from '@/config'
import { Webhook } from './type'
import { logger } from '@/utils'

export interface WebhookCallOptions {
  // 项目 Id
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
}

@Injectable()
export class WebhooksService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  // 处理 webhook
  async callWebhook(options: WebhookCallOptions) {
    const { projectId, resource, action, actionRes, actionOptions } = options

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
      logger.info('没有符合条件的 Webhook')
      return
    }

    logger.info(webhooks, 'Webhook 获取成功')

    const executions = webhooks.map(async (webhook: Webhook) => {
      const { method, url, headers = [] } = webhook

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

      await axios({
        method,
        url,
        headers: httpHeaders,
        data: {
          action,
          actionRes,
          collection: resource,
          actionFilter: actionOptions?.filter,
        },
        timeout: config.webhookTimeout,
      })
    })

    // TODO: 隔离处理，不影响请求
    await Promise.all(executions)

    logger.info('Webhook 触发成功！')
  }
}
