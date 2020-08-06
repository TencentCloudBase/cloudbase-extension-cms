import cloudbase from '@cloudbase/node-sdk'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import { isDev } from './env'

// 从环境变量中读取
export const getEnvIdString = () => {
  const { TCB_ENV, SCF_NAMESPACE, TCB_ENVID } = process.env
  return TCB_ENV || SCF_NAMESPACE || TCB_ENVID
}

export const getCloudBaseApp = () => {
  const { TCB_ENV, SCF_NAMESPACE } = cloudbase.getCloudbaseContext()
  // envId 为 symbol 值
  const envId = TCB_ENV || SCF_NAMESPACE || process.env.TCB_ENVID
  const customLoginJson = process.env.CMS_CUSTOM_LOGIN_JSON

  let credentials

  try {
    credentials = JSON.parse(customLoginJson)
  } catch (e) {
    throw new Error(
      '自定义秘钥解析异常，请填写下载的自定义秘钥全部内容。FAQ 文档：https://cloud.tencent.com/document/product/1220/47065#.E5.B8.B8.E8.A7.81.E9.97.AE.E9.A2.98'
    )
  }

  let options: ICloudBaseConfig = {
    credentials,
    env: envId
  }

  if (isDev()) {
    options = {
      ...options,
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY
    }
  }

  const app = cloudbase.init(options)

  return app
}
