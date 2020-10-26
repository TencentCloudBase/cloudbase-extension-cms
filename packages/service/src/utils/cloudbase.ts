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

export const getCloudBaseManager = (): CloudBase => {
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

  return manager
}

export const getUserFromCredential = async (credential: string, origin: string) => {
  const accessToken = credential.replace(/\/@@\/.*/g, '')
  const { data: res } = await Axios({
    method: 'POST',
    url: `https://cms-demo.ap-shanghai.tcb-api.tencentcloudapi.com/web?env=cms-demo`,
    headers: {
      origin,
      'content-type': 'application/json;charset=UTF-8',
      'x-sdk-version': '@cloudbase/js-sdk/1.3.4-alpha.0',
      'x-tcb-region': 'ap-shanghai',
    },
    data: {
      action: 'auth.getUserInfo',
      dataVersion: '2020-01-10',
      env: 'cms-demo',
      access_token: accessToken,
    },
  })

  if (res.data?.code || !res.data?.uuid) {
    console.log('获取用户信息失败', res.data)
    return null
  }

  return res.data
}
