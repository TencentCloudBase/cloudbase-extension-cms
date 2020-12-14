import { Collection } from '@/constants'
import cloudbase from '@cloudbase/node-sdk'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import { isDevEnv } from './tools'

// 从环境变量中读取
export const getEnvIdString = (): string => {
  const { TCB_ENV, SCF_NAMESPACE, TCB_ENVID } = process.env
  return TCB_ENV || SCF_NAMESPACE || TCB_ENVID
}

// 获取秘钥信息
export const getCredential = () => {
  if (isDevEnv()) {
    return {
      secretId: process.env.SECRETID,
      secretKey: process.env.SECRETKEY,
    }
  } else {
    return {
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY,
      token: process.env.TENCENTCLOUD_SESSIONTOKEN,
    }
  }
}

export const getCloudBaseApp = () => {
  // envId 为 symbol 值
  const envId = getEnvIdString()

  let options: ICloudBaseConfig = {
    env: envId,
  }

  if (isDevEnv()) {
    options = {
      ...options,
      secretId: process.env.SECRETID,
      secretKey: process.env.SECRETKEY,
    }
  }

  const app = cloudbase.init(options)

  return app
}

/**
 * 获取集合的 Schema
 */
export async function getCollectionSchema(collection: string): Promise<Schema>
export async function getCollectionSchema(): Promise<Schema[]>

export async function getCollectionSchema(collection?: string) {
  const app = getCloudBaseApp()

  const query = collection
    ? {
        collectionName: collection,
      }
    : {}

  const { data }: { data: Schema[] } = await app
    .database()
    .collection(Collection.Schemas)
    .where(query)
    .limit(1000)
    .get()

  return collection ? data[0] : data
}

export function cloudIdToUrl(cloudId: string) {
  if (!cloudId) {
    return ''
  }

  // 非 cloudId
  if (!/^cloud:\/\//.test(cloudId)) {
    return cloudId
  }

  // cloudId: cloud://cms-demo.636d-cms-demo-1252710547/cloudbase-cms/upload/2020-09-15/Psa3R3NA4rubCd_R-favicon.png
  let link = cloudId.replace('cloud://', '')
  // 文件路径
  const index = link.indexOf('/')
  // envId.bucket
  const prefix = link.slice(0, index)
  // [envId, bucket]
  const splitPrefix = prefix.split('.')

  // path 路径
  const path = link.slice(index + 1)

  let envId
  let trimBucket
  if (splitPrefix.length === 1) {
    trimBucket = splitPrefix[0]
  } else if (splitPrefix.length === 2) {
    envId = splitPrefix[0]
    trimBucket = splitPrefix[1]
  }

  if (envId) {
    envId = envId.trim()
  }

  return `https://${trimBucket}.tcb.qcloud.la/${path}`
}

// 以服务器模式运行，即通过监听端口的方式运行
export const isRunInServerMode = () =>
  process.env.NODE_ENV === 'development' ||
  !process.env.TENCENTCLOUD_RUNENV ||
  !!process.env.KUBERNETES_SERVICE_HOST
