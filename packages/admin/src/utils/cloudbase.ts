import { request, history } from 'umi'
import { message, notification } from 'antd'
import { RequestOptionsInit } from 'umi-request'
import { codeMessage } from '@/constants'
import { isDevEnv, random } from './tool'
import defaultSettings from '../../config/defaultSettings'
import { getFullDate } from './date'

let app: any
let auth: any

export async function getCloudBaseApp() {
  if (!app) {
    const { envId } = window.TcbCmsConfig || {}
    app = window.cloudbase.init({
      env: envId,
      // 默认可用区为上海
      region: window.TcbCmsConfig.region || 'ap-shanghai',
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
  if (!auth) {
    const app = await getCloudBaseApp()
    auth = app.auth({ persistence: 'local' })
  }

  // 登陆
  await auth.signInWithUsernameAndPassword(username, password)
}

export function getAuthHeader() {
  if (!app) {
    const { envId } = window.TcbCmsConfig || {}
    app = window.cloudbase.init({
      env: envId,
      // 默认可用区为上海
      region: window.TcbCmsConfig.region || 'ap-shanghai',
    })
  }

  const auth = app.auth()
  return auth.getAuthHeader()
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
): Promise<T> {
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
export async function uploadFile(
  file: File,
  onProgress: (v: number) => void,
  filePath?: string
): Promise<string> {
  const app = await getCloudBaseApp()
  const day = getFullDate()

  // 文件名
  const uploadFilePath = filePath || `upload/${day}/${random(32)}-${file.name}`

  const result = await app.uploadFile({
    filePath: file,
    cloudPath: `cloudbase-cms/${uploadFilePath}`,
    onUploadProgress: (progressEvent: ProgressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress(percentCompleted)
    },
  })

  // 文件 id
  return result.fileID
}

// 获取文件的临时访问链接
export async function getTempFileURL(fileId: string): Promise<string> {
  const app = await getCloudBaseApp()
  const result = await app.getTempFileURL({
    fileList: [fileId],
  })

  if (result.fileList[0].code !== 'SUCCESS') {
    throw new Error(result.fileList[0].code)
  }

  return result.fileList[0].tempFileURL
}

/**
 * 批量获取文件临时访问链接
 */
export async function batchGetTempFileURL(
  fileIds: string[]
): Promise<
  {
    fileID: string
    tempFileURL: string
  }[]
> {
  const app = await getCloudBaseApp()
  const result = await app.getTempFileURL({
    fileList: fileIds,
  })

  result.fileList.forEach((ret: any) => {
    if (ret.code !== 'SUCCESS') {
      throw new Error(ret.code)
    }
  })

  return result.fileList
}

// 下载文件
export async function downloadFile(fileId: string) {
  const app = await getCloudBaseApp()

  const result = await app.downloadFile({
    fileID: fileId,
  })

  console.log('下载文件', fileId, result)
}

export const isFileId = (v: string) => /^cloud:\/\/\S+/.test(v)

export const getFileNameFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname || ''
    return pathname.split('/').pop()
  } catch (error) {
    return ''
  }
}

export function fileIdToUrl(fileId: string) {
  if (!fileId) {
    return ''
  }

  // 非 fileId
  if (!/^cloud:\/\//.test(fileId)) {
    return fileId
  }

  // cloudId: cloud://cms-demo.636d-cms-demo-1252710547/cloudbase-cms/upload/2020-09-15/Psa3R3NA4rubCd_R-favicon.png
  let link = fileId.replace('cloud://', '')
  // 文件路径
  const index = link.indexOf('/')
  // envId.bucket
  const prefix = link.slice(0, index)
  // [envId, bucket]
  const splitPrefix = prefix.split('.')

  // path 路径
  const path = link.slice(index + 1)

  let envId
  let trimBucket
  if (splitPrefix.length === 1) {
    trimBucket = splitPrefix[0]
  } else if (splitPrefix.length === 2) {
    envId = splitPrefix[0]
    trimBucket = splitPrefix[1]
  }

  if (envId) {
    envId = envId.trim()
  }

  return `https://${trimBucket}.tcb.qcloud.la/${path}`
}
