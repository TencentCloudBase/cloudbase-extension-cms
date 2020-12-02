import Axios from 'axios'
import request from 'request'
import cloudbase from '@cloudbase/node-sdk'
import CloudBaseManager from '@cloudbase/manager-node'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import { isDevEnv } from './tools'

// 从环境变量中读取
export const getEnvIdString = (): string => {
  const { TCB_ENV, SCF_NAMESPACE, TCB_ENVID } = process.env
  return TCB_ENV || SCF_NAMESPACE || TCB_ENVID
}

let nodeApp
let managerApp
let secretManager: SecretManager

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

export const getCloudBaseManager = async (): Promise<CloudBaseManager> => {
  if (managerApp) {
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
    const { secretId, secretKey, token } = await secretManager.getTmpSecret()
    options = { ...options, secretId, secretKey, token }
  }

  const manager = new CloudBaseManager(options)
  managerApp = manager

  return manager
}

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
      'x-sdk-version': '@cloudbase/js-sdk/1.3.4-alpha.0',
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
    console.log('获取用户信息失败', res.data)
    return null
  }

  return res.data
}

// 以服务器模式运行，即通过监听端口的方式运行
export const isRunInServerMode = () =>
  process.env.NODE_ENV === 'development' ||
  !process.env.TENCENTCLOUD_RUNENV ||
  !!process.env.KUBERNETES_SERVICE_HOST

export const isRunInContainer = () => !!process.env.KUBERNETES_SERVICE_HOST

interface Secret {
  secretId: string
  secretKey: string
  token: string
  expire: number // 过期时间，单位：秒
}

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
