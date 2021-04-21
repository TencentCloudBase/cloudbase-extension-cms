import Axios from 'axios'
import request from 'request'
import cloudbase, { CloudBase, ICallFunctionRes } from '@cloudbase/node-sdk'
import CloudBaseManager from '@cloudbase/manager-node'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import { Collection } from '@/constants'
import { isDevEnv } from './tools'
import { MemoryCache } from './cache'
import { getUnixTimestamp } from './date'

let nodeApp: CloudBase
let managerApp
let secretExpire: number
let secretManager: SecretManager

/**
 * 内存缓存
 */
const schemaCache = new MemoryCache()

/**
 * 从环境变量中获取 envId
 */
export const getEnvIdString = (): string => {
  const { TCB_ENV, SCF_NAMESPACE, TCB_ENVID, ENV_ID } = process.env
  return TCB_ENV || SCF_NAMESPACE || TCB_ENVID || ENV_ID
}

/**
 * 获取初始化后的 cloudbase node sdk 实例
 */
export const getCloudBaseApp = () => {
  if (nodeApp) {
    return nodeApp
  }
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
  nodeApp = app
  return app
}

/**
 * 获取初始化后的 cloudbase manager sdk 实例
 */
export const getCloudBaseManager = async (): Promise<CloudBaseManager> => {
  // +120 缓冲时间
  const now = getUnixTimestamp() + 120

  // 秘钥没有过期，可以继续使用，否则，需要重新获取秘钥
  if (managerApp && now < secretExpire) {
    return managerApp
  }

  const envId = getEnvIdString()

  let options: ICloudBaseConfig = {
    envId,
  }

  if (isDevEnv()) {
    options = {
      ...options,
      secretId: process.env.SECRETID,
      secretKey: process.env.SECRETKEY,
    }
  }

  // 云托管中
  if (isRunInContainer()) {
    secretManager = new SecretManager()
    const { secretId, secretKey, token, expire } = await secretManager.getTmpSecret()
    secretExpire = expire
    options = { ...options, secretId, secretKey, token }
  }

  const manager = new CloudBaseManager(options)
  managerApp = manager

  return manager
}

/**
 * 调用云函数
 */
export const callFunction = async (functionName: string, data: any): Promise<ICallFunctionRes> => {
  const app = getCloudBaseApp()

  return app.callFunction({
    data,
    name: functionName,
  })
}

/**
 * 从 credential header 中获取用户信息
 */
export const getUserFromCredential = async (credential: string, origin: string) => {
  const envId = getEnvIdString()
  const region = process.env.TENCENTCLOUD_REGION || 'ap-shanghai'
  const accessToken = credential.replace(/\/@@\/.*/g, '')

  const { data: res } = await Axios({
    method: 'POST',
    url: `https://${envId}.${region}.tcb-api.tencentcloudapi.com/web?env=${envId}`,
    headers: {
      origin,
      'content-type': 'application/json',
      'x-sdk-version': '@cloudbase/js-sdk/1.4.0',
      'x-tcb-region': region,
    },
    data: {
      action: 'auth.getUserInfo',
      dataVersion: '2020-01-10',
      env: envId,
      access_token: accessToken,
    },
  })

  if (res.data?.code || !res.data?.uuid) {
    console.error('获取用户信息失败', res.data)
    return null
  }

  return res.data
}

/**
 * 获取并缓存集合对应 Schema
 */
export async function getCollectionSchema(collection: string): Promise<Schema>
export async function getCollectionSchema(): Promise<Schema[]>

export async function getCollectionSchema(collection?: string) {
  // 全部 schemas 使用 SCHEMAS 作为 key 缓存
  const cacheSchema = collection ? schemaCache.get(collection) : schemaCache.get('SCHEMAS')
  // 容器模式，才启用本地缓存
  if (cacheSchema && isRunInContainer()) return cacheSchema

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

  if (collection) {
    schemaCache.set(collection, data[0])
  } else {
    schemaCache.set('SCHEMAS', data)
  }

  return collection ? data[0] : data
}

/**
 * 清除 schema 缓存
 */
export const clearSchemaCache = (collection: string) => {
  // 清除 collection 对应的缓存
  schemaCache.del(collection)
  // schema 变更时，schemas 也失效，清除 SCHEMAS（全部 schema 数组）缓存
  schemaCache.del('SCHEMAS')
}

// 以服务器模式运行，即通过监听端口的方式运行
export const isRunInServerMode = () =>
  process.env.NODE_ENV === 'development' ||
  !process.env.TENCENTCLOUD_RUNENV ||
  !!process.env.KUBERNETES_SERVICE_HOST

// 是否在云函数中运行
export const isInSCF = () => process.env.TENCENTCLOUD_RUNENV === 'SCF'

// 是否在云托管中运行
export const isRunInContainer = () => !!process.env.KUBERNETES_SERVICE_HOST

interface Secret {
  secretId: string
  secretKey: string
  token: string
  expire: number // 过期时间，单位：秒
}

/**
 * 从容器运行环境中获取临时秘钥
 */
export default class SecretManager {
  private tmpSecret: Secret | null
  private TMP_SECRET_URL: string
  public constructor() {
    this.TMP_SECRET_URL =
      'http://metadata.tencentyun.com/meta-data/cam/security-credentials/TCB_QcsRole'
    this.tmpSecret = null
  }

  public async getTmpSecret(): Promise<Secret> {
    if (this.tmpSecret) {
      const now = new Date().getTime()
      const expire = this.tmpSecret.expire * 1000
      const oneHour = 3600 * 1000
      if (now < expire - oneHour) {
        // 密钥没过期
        return this.tmpSecret
      } else {
        // 密钥过期
        return this.fetchTmpSecret()
      }
    } else {
      return this.fetchTmpSecret()
    }
  }

  private async fetchTmpSecret(): Promise<Secret> {
    const body: any = await this.get(this.TMP_SECRET_URL)
    const payload = JSON.parse(body)

    this.tmpSecret = {
      secretId: payload.TmpSecretId,
      secretKey: payload.TmpSecretKey,
      expire: payload.ExpiredTime, // 过期时间，单位：秒
      token: payload.Token,
    }

    return this.tmpSecret
  }

  private get(url) {
    return new Promise((resolve, reject) => {
      request.get(url, (err, res, body) => {
        if (err) {
          reject(err)
        } else {
          resolve(body)
        }
      })
    })
  }
}
