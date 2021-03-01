import Axios from 'axios'
import wxCloud from 'wx-server-sdk'
import cloudbase, { CloudBase } from '@cloudbase/node-sdk'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import CloudBaseManager from '@cloudbase/manager-node'
import { isDevEnv } from './tools'

let nodeApp: CloudBase

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

/**
 * 获取初始化后的 cloudbase node sdk 实例
 */
export const getCloudBaseApp = (): CloudBase => {
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
 * 获取微信 cloud 实例
 */
export const getWxCloudApp = () => {
  const { ENV } = wxCloud.getWXContext()

  wxCloud.init({
    env: ENV,
  })

  return wxCloud
}

let managerApp
let secretExpire: number

/**
 * 获取初始化后的 cloudbase manager sdk 实例
 */
export const getCloudBaseManager = (): CloudBaseManager => {
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

  const manager = new CloudBaseManager(options)
  managerApp = manager

  return manager
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
    console.error(res.data, '获取用户信息失败')
    return null
  }

  return res.data
}

// 以服务器模式运行，即通过监听端口的方式运行
export const isRunInServerMode = () =>
  process.env.NODE_ENV === 'development' ||
  !process.env.TENCENTCLOUD_RUNENV ||
  !!process.env.KUBERNETES_SERVICE_HOST
