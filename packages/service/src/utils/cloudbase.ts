import cloudbase from '@cloudbase/node-sdk'
import CloudBase from '@cloudbase/manager-node'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import { isDevEnv } from './tools'

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
