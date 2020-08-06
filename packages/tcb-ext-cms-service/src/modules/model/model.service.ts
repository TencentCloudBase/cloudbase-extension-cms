import { Injectable, Inject } from '@nestjs/common'
import { Db } from '@cloudbase/database'
import config from '@/config'

import DataProvider from './dataProvider'
import checkPermission from './checkPermission'
import callModelLifeCycle from './callModelLifeCycle'
import callWebhook from './callWebhook'

export interface ICallParams {
  // 资源，集合名
  resource: string
  // 操作
  operate: string
  // 参数
  params: any
}

export interface ICallContext {
  db: Db
  userInfo: any
  dbUser: any
}

@Injectable()
export class ModelService {
  async callModel(modelParams: ICallParams, context: any) {
    const { resource, operate, params } = modelParams
    const { db, envId, dbUser } = context

    const dataProvider = DataProvider(db)
    // 校验权限
    const can = await checkPermission(modelParams, context)

    // 支持的操作
    const supportWebhookOperates = ['create', 'update', 'updateMany', 'delete', 'deleteMany']

    const notSupportWebhookResources = [
      config.collection.contents,
      config.collection.users,
      config.collection.webhooks
    ]

    if (can) {
      // 前置钩子
      await callModelLifeCycle('before', modelParams, context)
      // 执行数据操作
      const result = await dataProvider[operate](resource, {
        ...params,
        envId,
        dbUser,
        config
      })

      // 后置钩子
      await callModelLifeCycle('after', modelParams, result)

      // 调用 Webhook
      if (
        supportWebhookOperates.includes(operate) &&
        !notSupportWebhookResources.includes(resource)
      ) {
        await callWebhook(modelParams, context, result)
      }
      return result
    } else {
      return {
        code: 'NO_AUTH',
        messsage: '无权限操作'
      }
    }
  }
}
