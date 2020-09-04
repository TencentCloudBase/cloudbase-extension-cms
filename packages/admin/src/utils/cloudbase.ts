import moment from 'moment'
import { request, history } from 'umi'
import { message, notification } from 'antd'
import { RequestOptionsInit } from 'umi-request'
import { codeMessage } from '@/constants'
import { isDevEnv } from './tool'
import defaultSettings from '../../config/defaultSettings'
import { random } from 'lodash'

let app: any
let auth: any

export async function getCloudBaseApp() {
  if (!app) {
    const { envId } = window.TcbCmsConfig || {}
    app = window.cloudbase.init({
      env: envId,
    })
  }

  if (!auth) {
    auth = app.auth({ persistence: 'local' })
  }

  const loginState = await auth.getLoginState()

  if (!loginState && !isDevEnv()) {
    message.error('您还没有登录或登录已过期，请登录后再操作！')
    history.push('/login')
  }

  return app
}

// 用户名密码登录
export async function loginWithPassword(username: string, password: string) {
  // 登陆
  await auth.signInWithUsernameAndPassword(username, password)
}

export async function logout() {
  if (!auth) {
    const app = await getCloudBaseApp()
    auth = app.auth({ persistence: 'local' })
  }

  await auth.signOut()
}

// 兼容本地开发与云函数请求
export async function tcbRequest<T = any>(
  url: string,
  options: RequestOptionsInit & { skipErrorHandler?: boolean } = {}
) {
  if (url === '/auth/login' && !isDevEnv()) {
    return request<T>(url, options)
  }

  if (isDevEnv()) {
    return request<T>(url, options)
  }

  const { method, params, data } = options
  const app = await getCloudBaseApp()

  const res = await app.callFunction({
    name: 'tcb-ext-cms-service',
    data: {
      path: `${defaultSettings.globalPrefix}${url}`,
      httpMethod: method,
      queryStringParameters: params,
      body: data,
    },
  })

  if (res.result?.statusCode === 500) {
    notification.error({
      message: '请求错误',
      description: `服务异常：${status}: ${url}`,
    })
    // throw new Error('服务异常')
  }

  // 转化响应值
  let body
  try {
    body = JSON.parse(res.result.body)
  } catch (error) {
    console.log(error)
    body = {}
  }

  if (body?.error) {
    const errorText = codeMessage[res.result?.statusCode || 500]
    notification.error({
      message: errorText,
      description: `请求错误：【${body.error.code}】: ${body.error.message}`,
    })
    throw new Error('服务异常')
  }

  return body
}

// 上传文件
export async function uploadFile(file: File, onProgress: (v: number) => void): Promise<string> {
  const app = await getCloudBaseApp()
  const day = moment().format('YYYY-MM-DD')

  const result = await app.uploadFile({
    filePath: file,
    cloudPath: `cloudbase-cms/${day}/${random(32)}-${file.name}`,
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

  if (result.fileList[0].code !== 'SUCCESS') {
    throw new Error(result.fileList[0].code)
  }

  return result.fileList[0].tempFileURL
}

// 下载文件
export async function downloadFile(cloudId: string) {
  const app = await getCloudBaseApp()

  const result = await app.downloadFile({
    fileID: cloudId,
  })

  console.log('下载文件', cloudId, result)
}
