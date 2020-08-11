import cloudbase from '@cloudbase/node-sdk'
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
    const customLoginJson = process.env.CMS_CUSTOM_LOGIN_JSON

    let credentials

    try {
        credentials = JSON.parse(customLoginJson)
    } catch (e) {
        // throw new Error('登录异常')
    }

    let options: ICloudBaseConfig = {
        credentials,
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
