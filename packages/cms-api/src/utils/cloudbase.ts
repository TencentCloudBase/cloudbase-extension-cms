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
