import { request, history } from 'umi'
import { message, notification } from 'antd'
import { RequestOptionsInit } from 'umi-request'
import { codeMessage } from '@/constants'
import defaultSettings from '../../config/defaultSettings'
import { isDevEnv, random } from './tool'
import { getFullDate } from './date'

let app: any
let auth: any

initCloudBaseApp()

/**
 * 获取 CloudBase App 实例
 */
export async function getCloudBaseApp() {
  const loginState = await auth.getLoginState()

  if (!loginState && !isDevEnv()) {
    message.error('您还没有登录或登录已过期，请登录后再操作！')
    history.push('/login')
  }

  return app
}

// 初始化 app 实例
function initCloudBaseApp() {
  if (!app) {
    const { envId } = window.TcbCmsConfig || {}
    app = window.cloudbase.init({
      env: envId,
      // 默认可用区为上海
      region: window.TcbCmsConfig.region || 'ap-shanghai',
    })
    console.log('init cloudbase app')
  }

  if (!auth) {
    console.log('init cloudbase app auth')
    auth = app.auth({ persistence: 'local' })
  }
}

// 用户名密码登录
export async function loginWithPassword(username: string, password: string) {
  // 登陆
  await auth.signInWithUsernameAndPassword(username, password)
}

export function getAuthHeader() {
  return auth.getAuthHeader()
}

let gotAuthHeader = false
let gotAuthTime = 0
/**
 * 获取 x-cloudbase-credentials 请求 Header
 */
export async function getAuthHeaderAsync() {
  // 直接读取本地
  let res = auth.getAuthHeader()
  const diff = Date.now() - gotAuthTime

  // TODO: 当期 SDK 同步获取的 token 可能是过期的
  // 临时解决办法：在首次获取时、间隔大于 3500S 时，刷新 token
  if (!res?.['x-cloudbase-credentials'] || !gotAuthHeader || diff > 3500000) {
    res = await auth.getAuthHeaderAsync()
    gotAuthHeader = true
    gotAuthTime = Date.now()
  }

  return res
}

/**
 * 退出登录
 */
export async function logout() {
  await auth.signOut()
}

// 兼容本地开发与云函数请求
export async function tcbRequest<T = any>(
  url: string,
  options: RequestOptionsInit & { skipErrorHandler?: boolean } = {}
): Promise<T> {
  if (isDevEnv() || SERVER_MODE) {
    return request<T>(url, options)
  }

  const { method, params, data } = options
  const app = await getCloudBaseApp()

  const functionName = WX_MP ? 'wx-ext-cms-service' : 'tcb-ext-cms-service'

  const res = await app.callFunction({
    parse: true,
    name: functionName,
    data: {
      body: data,
      httpMethod: method,
      queryStringParameters: params,
      path: `${defaultSettings.globalPrefix}${url}`,
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
    body = typeof res.result.body === 'string' ? JSON.parse(res.result.body) : res.result.body
  } catch (error) {
    body = res.result.body
    console.log(error)
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
  let ext
  if (file.name?.length && file.name.includes('.')) {
    ext = file.name.split('.').pop()
    ext = `.${ext}`
  } else {
    ext = file.name
  }

  const uploadFilePath = filePath || `upload/${day}/${random(32)}_${ext}`

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
  if (!fileIds?.length) return []
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

  // cloudId: cloud://cms-demo.636d-cms-demo-1252710547/cloudbase-cms/upload/2020-09-15/Psa3R3NA4rubCd_R-favicon-wx.svg
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
