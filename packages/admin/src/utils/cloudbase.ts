import { message } from 'antd'
import { request, history } from 'umi'
import { RequestOptionsInit } from 'umi-request'
import { isDevEnv } from './utils'

let app: any

export async function getCloudBaseApp() {
    if (!app) {
        const { envId } = window.TcbCmsConfig || {}
        app = window.tcb.init({
            env: envId,
        })
    }

    const loginState = await app.auth({ persistence: 'local' }).getLoginState()

    if (!loginState) {
        message.error('登录态失效，请重新登录！')
        history.push('/login')
    }

    return app
}

// 兼容本地开发与云函数请求
export async function tcbRequest<T = any>(
    url: string,
    options: RequestOptionsInit & { skipErrorHandler?: boolean } = {}
) {
    // if (isDevEnv()) {
    //     return request<T>(url, options)
    // }

    const { method, params, data } = options
    const app = await getCloudBaseApp()

    const res = await app.callFunction({
        name: 'service',
        data: {
            path: url,
            httpMethod: method,
            queryStringParameters: params,
            body: data,
        },
    })

    // 转化响应值
    let body
    try {
        body = JSON.parse(res.result.body)
    } catch (error) {
        console.log(error)
        body = {}
    }

    console.log(body)

    return body
}

// 自定义登录
export async function customLogin(ticket: string) {
    try {
        // 登陆
        await app
            .auth({
                persistence: 'local',
            })
            .customAuthProvider()
            .signIn(ticket)
    } catch (e) {
        console.log(e)
        message.error('登录失败')
    }
}

// 上传文件
export async function uploadFile(file: File, onProgress: (v: number) => void): Promise<string> {
    const app = await getCloudBaseApp()

    const result = await app.uploadFile({
        cloudPath: `upload/${Date.now()}.${file.name.split('.').slice(-1)[0]}`,
        filePath: file,
        onUploadProgress: (progressEvent: ProgressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
        },
    })

    return result.fileID
}

export async function getTempFileURL(cloudId: string): Promise<string> {
    const app = await getCloudBaseApp()
    const result = await app.getTempFileURL({
        fileList: [cloudId],
    })
    return result.fileList[0].tempFileURL
}
