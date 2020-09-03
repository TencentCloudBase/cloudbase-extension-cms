import axios from 'axios'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { CollectionV2 } from '@/constants'
import config from '@/config'
import { Webhook } from './type'

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
    const { data: webhooks } = await this.cloudbaseService
      .collection(CollectionV2.Webhooks)
      .where({
        projectId,
        event: $.or($.elemMatch($.eq('*')), $.elemMatch($.eq(webhookEvent))),
        collections: $.or(
          $.elemMatch($.eq('*')),
          $.elemMatch({
            collectionName: resource,
          })
        ),
      })
      .get()

    if (!webhooks?.length) {
      return
    }

    const executions = webhooks.map(async (webhook: Webhook) => {
      const { name, method, url, headers = [], _id } = webhook

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
          webhookId: _id,
          webhookName: name,
          collection: resource,
          action,
          actionRes,
          actionFilter: actionOptions?.filter,
        },
        timeout: config.webhookTimeout,
      })
    })

    // TODO: 隔离处理，不影响请求
    await Promise.all(executions)
  }
}
