import cloudbase from '@cloudbase/node-sdk'
import { ICloudBaseConfig } from '@cloudbase/node-sdk/lib/type'
import { isDev } from './env'

// 从环境变量中读取
export const getEnvIdString = (): string => {
    return process.env.TCB_ENVID
}

export const getCloudBaseApp = () => {
    // envId 为 symbol 值
    const envId = getEnvIdString()
    const customLoginJson = process.env.CMS_CUSTOM_LOGIN_JSON

    let credentials

    try {
        credentials = JSON.parse(customLoginJson)
    } catch (e) {
        // throw new Error('登录异常')
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
