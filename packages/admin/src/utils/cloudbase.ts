import { getState } from 'concent'
import { request, history } from 'umi'
import { notification } from 'antd'
import { RequestOptionsInit } from 'umi-request'
import { uploadFilesToHosting } from '@/services/apis'
import { codeMessage, RESOURCE_PREFIX } from '@/constants'
import defaultSettings from '../../config/defaultSettings'
import { isDevEnv, random } from './common'
import { getDay, getFullDate, getMonth, getYear } from './date'
import { downloadFileFromUrl } from './file'
import { templateCompile } from './templateCompile'

interface IntegrationRes {
  statusCode: number
  headers: Record<string, string>
  body: string
  isBase64Encoded: true | false
}

let app: any
let auth: any

initCloudBaseApp()

/**
 * 获取 CloudBase App 实例
 */
export async function getCloudBaseApp() {
  const loginState = await auth.getLoginState()

  if (!loginState && !isDevEnv()) {
    history.push('/login')
  }

  return app
}

let wxCloudApp: any

/**
 * 处理微信 Web SDK 的登录
 */
export function getWxCloudApp() {
  // 全局 state
  const state: any = getState()
  const { envId, mpAppID } = window.TcbCmsConfig || {}
  const miniappID = mpAppID || state?.global?.setting?.miniappID

  if (!wxCloudApp) {
    // 声明新的 cloud 实例
    wxCloudApp = new window.cloud.Cloud({
      // 必填，表示是未登录模式
      identityless: true,
      // 资源方环境 ID
      resourceEnv: envId,
      // 资源方 AppID
      resourceAppid: miniappID,
    })

    wxCloudApp.init({
      env: envId,
      appid: miniappID,
    })
  }

  return wxCloudApp
}

/**
 * 初始化云开发 app、auth 实例
 */
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

/**
 * 用户名密码登录
 * @param username
 * @param password
 */
export async function loginWithPassword(username: string, password: string) {
  // 登陆
  await auth.signInWithUsernameAndPassword(username, password)
}

/**
 * 获取当前登录态信息
 */
export async function getLoginState() {
  // 获取登录态
  return auth.getLoginState()
}

/**
 * 同步获取 x-cloudbase-credentials
 */
export function getAuthHeader() {
  return auth.getAuthHeader()
}

let gotAuthHeader = false
let gotAuthTime = 0
/**
 * 异步获取 x-cloudbase-credentials 请求 Header
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

/**
 * 兼容本地开发与云函数请求
 */
export async function tcbRequest<T = any>(
  url: string,
  options: RequestOptionsInit & { skipErrorHandler?: boolean } = {}
): Promise<T> {
  if (isDevEnv() || SERVER_MODE) {
    return request<T>(url, options)
  }

  const { method, params, data } = options
  const app = await getCloudBaseApp()

  const functionName = `${RESOURCE_PREFIX}-service`

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

  return parseIntegrationRes(res.result)
}

/**
 * 调用微信 Open API
 * @param action 行为
 * @param data POST body 数据
 */
export async function callWxOpenAPI(action: string, data?: Record<string, any>) {
  console.log(`callWxOpenAPI 参数`, data)

  if (isDevEnv()) {
    return request(`/api/${action}`, {
      data,
      prefix: 'http://127.0.0.1:5003',
      method: 'POST',
    })
  }

  const wxCloudApp = getWxCloudApp()

  // 添加 authHeader
  const authHeader = getAuthHeader()

  const functionName = `${RESOURCE_PREFIX}-openapi`

  // 调用 open api
  const { result } = await wxCloudApp.callFunction({
    name: functionName,
    data: {
      body: data,
      headers: authHeader,
      httpMethod: 'POST',
      queryStringParameters: '',
      path: `/api/${action}`,
    },
  })

  return parseIntegrationRes(result)
}

/**
 * 解析函数集成响应
 */
function parseIntegrationRes(result: IntegrationRes) {
  // 转化响应值
  let body
  try {
    body =
      typeof result.body === 'string' && result.body?.length ? JSON.parse(result.body) : result.body
  } catch (error) {
    console.log(error)
    body = result.body
  }

  if (body?.error) {
    const errorText = codeMessage[result?.statusCode || 500]
    notification.error({
      message: errorText,
      description: `请求错误：【${body.error.code}】: ${body.error.message}`,
    })
    throw new Error('服务异常')
  }

  return body
}

/**
 * 上传文件到文件存储、静态托管
 */
export async function uploadFile(options: {
  /**
   * 需要上传的文件
   */
  file: File

  /**
   * 指定上传文件的路径
   */
  filePath?: string

  /**
   * 文件名随机的长度
   */
  filenameLength?: number

  /**
   * 进度事件
   */
  onProgress?: (v: number) => void
  /**
   * 文件上传存储类型，静态网站托管或云存储
   * 默认为 storage
   */
  uploadType?: 'hosting' | 'storage'

  /**
   * 路径模版，根据模版规则做动态替换
   * 以 cloudbase-cms 为基础路径
   */
  filePathTemplate?: string
}): Promise<string> {
  const {
    file,
    onProgress,
    filePath,
    uploadType = 'storage',
    filenameLength = 32,
    filePathTemplate,
  } = options

  const app = await getCloudBaseApp()
  const day = getFullDate()

  // 文件名
  let ext
  if (file.name?.length && file.name.includes('.')) {
    ext = file.name.split('.').pop()
    ext = `.${ext}`
  } else {
    ext = ''
  }

  // 模版变量
  const templateData: any = {
    // 文件扩展
    ext,
    // 文件名
    filename: file.name,
    // 今日日期
    date: day,
    // 年份，如 2021
    year: getYear(),
    // 月份，如 03
    month: getMonth(),
    // 日，如 02
    day: getDay(),
  }

  // 添加 random1 到 random64
  for (let i = 1; i <= 64; i++) {
    templateData[`random${i}`] = random(i)
  }

  let uploadFilePath: string

  // 路径模版优先级最高
  if (filePathTemplate) {
    uploadFilePath = 'cloudbase-cms/' + templateCompile(filePathTemplate, templateData)
  } else {
    uploadFilePath = filePath || `cloudbase-cms/upload/${day}/${random(filenameLength)}_${ext}`
  }

  // 上传文件到静态托管
  if (uploadType === 'hosting') {
    // 返回 URL 信息数组
    const ret = await uploadFilesToHosting(file, uploadFilePath)
    onProgress?.(100)
    return ret[0].url
  }

  // 上传文件到云存储
  const result = await app.uploadFile({
    filePath: file,
    cloudPath: uploadFilePath,
    onUploadProgress: (progressEvent: ProgressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress?.(percentCompleted)
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
  const tmpUrl = await getTempFileURL(fileId)
  const fileUrl =
    tmpUrl + `${tmpUrl.includes('?') ? '&' : '?'}response-content-disposition=attachment`
  const fileName = decodeURIComponent(new URL(fileUrl).pathname.split('/').pop() || '')

  downloadFileFromUrl(fileUrl, fileName)
}

/**
 * 判断一个 URL 是否为 FileId
 */
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

/**
 * 获取 HTTP 访问地址
 */
export const getHttpAccessPath = () => {
  return isDevEnv()
    ? defaultSettings.globalPrefix
    : SERVER_MODE
    ? `https://${window.TcbCmsConfig.containerAccessPath}${defaultSettings.globalPrefix}`
    : `https://${window.TcbCmsConfig.cloudAccessPath}${defaultSettings.globalPrefix}`
}
