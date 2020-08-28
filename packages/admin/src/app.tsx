import { run } from 'concent'
import { notification, message } from 'antd'
import { ResponseError } from 'umi-request'
import { history, RequestConfig } from 'umi'
import { codeMessage } from '@/constants'
import { BasicLayoutProps, Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout'
import { queryCurrent } from './services/user'
import defaultSettings from '../config/defaultSettings'
import { getCloudBaseApp, isDevEnv } from './utils'
import * as models from './models'

run(models)

export async function getInitialState(): Promise<{
  currentUser?: API.CurrentUser
  settings?: LayoutSettings
  menu?: any[]
}> {
  let app
  let loginState

  try {
    app = await getCloudBaseApp()
    // 获取登录态
    loginState = await app
      .auth({
        persistence: 'local',
      })
      .getLoginState()
  } catch (error) {
    console.log(error)
    message.error(`CloudBase JS SDK 初始化失败，${error.message}`)
  }

  // 没有登录，重新登录
  if (!isDevEnv() && !loginState) {
    history.push('/login')
    return {}
  }

  let initialState: {
    menu?: MenuDataItem[]
    currentUser?: API.CurrentUser
    settings?: LayoutSettings
  } = {}
  let currentUser = {} as any

  // 如果是登录页面，不执行
  if (history.location.pathname !== '/login') {
    try {
      currentUser = await queryCurrent()
    } catch (e) {
      console.log(e)
    }
  } else {
    try {
      currentUser = await queryCurrent()
    } catch (e) {
      console.log(e)
    }
  }

  initialState = {
    currentUser,
    settings: defaultSettings,
  }

  return initialState
}

// 简单配置
export const layout = ({
  initialState = {},
}: {
  initialState: { menu?: MenuDataItem[]; settings?: LayoutSettings; currentUser?: API.CurrentUser }
}): BasicLayoutProps => {
  const { currentUser } = initialState

  return {
    pure: true,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!currentUser?._id && history.location.pathname !== '/login') {
        history.push('/login')
      }
    },
  }
}

/**
 * 请求异常处理
 */
const errorHandler = (error: ResponseError) => {
  const { response } = error

  if (response?.status) {
    const errorText = codeMessage[response.status] || response.statusText
    const { status, url } = response

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    })
  }

  // if (!response) {
  //     notification.error({
  //         description: '您的网络发生异常，无法连接服务器',
  //         message: '网络异常'
  //     })
  // }

  throw error
}

/**
 * 全局 request 配置
 */
export const request: RequestConfig = {
  prefix: isDevEnv()
    ? defaultSettings.globalPrefix
    : `https://${window.TcbCmsConfig.cloudAccessPath}${defaultSettings.globalPrefix}`,
  errorHandler,
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: !resData.code,
        errorMessage: resData.message,
      }
    },
  },
  responseInterceptors: [
    async (response, options) => {
      const data = await response.clone().json()
      if (data.code) {
        notification.error({
          message: data.message || data.code,
          description: data.requestId ? `${data.code}\n[requestId]${data.requestId}` : data.code,
        })
      }

      return response
    },
  ],
}
