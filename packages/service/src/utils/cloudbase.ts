import cloudbase from '@cloudbase/node-sdk'
import CloudBase from '@cloudbase/manager-node'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import { isDevEnv } from './tools'
import Axios from 'axios'

// 从环境变量中读取
export const getEnvIdString = (): string => {
  const { TCB_ENV, SCF_NAMESPACE, TCB_ENVID } = process.env
  return TCB_ENV || SCF_NAMESPACE || TCB_ENVID
}

let nodeApp
let managerApp

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

export const getCloudBaseManager = (): CloudBase => {
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

  const manager = new CloudBase(options)
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
