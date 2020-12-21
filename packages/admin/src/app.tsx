import React from 'react'
import { run } from 'concent'
import { notification, message, Typography } from 'antd'
import { Context, ResponseError } from 'umi-request'
import { history, RequestConfig } from 'umi'
import { codeMessage } from '@/constants'
import { BasicLayoutProps, Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout'
import { queryCurrent } from './services/user'
import defaultSettings from '../config/defaultSettings'
import { getAuthHeaderAsync, getCloudBaseApp, isDevEnv } from './utils'
import * as models from './models'

run(models)

export async function getInitialState(): Promise<{
  currentUser?: Partial<API.CurrentUser>
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
    message.error(`CloudBase JS SDK 初始化失败，${error?.message}`)
  }

  // 没有登录，重新登录
  if (!isDevEnv() && !loginState) {
    history.push('/login')
    // 移除 loading 元素
    document.getElementById('loading')?.remove()
    return {}
  }

  let initialState: {
    menu?: MenuDataItem[]
    currentUser?: Partial<API.CurrentUser>
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

  // 已经登录成功，响应低码平台
  if (currentUser?._id && window.parent !== window.self) {
    window.parent.postMessage(
      JSON.stringify({
        from: 'cms',
        status: 'success',
      }),
      '*'
    )
  }

  // 移除 loading 元素
  document.getElementById('loading')?.remove()
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
const errorHandler = async (error: ResponseError) => {
  const { response, data } = error

  if (response?.status) {
    const errorText = codeMessage[response.status] || response.statusText
    const { status, url } = response

    const data = await response.clone().json()
    const message = data?.error?.message || data?.error?.code

    notification.error({
      message: `请求错误 ${status}`,
      description: (
        <>
          <Typography.Text>{`${errorText} ${message || ''}`}</Typography.Text>
          <Typography.Text copyable>请求 URL：{url}</Typography.Text>
        </>
      ),
    })
  }

  if (data?.error) {
    const message = data?.error?.message || data?.error?.code

    notification.error({
      message: data.error.code,
      description: <Typography.Text>{`${message}`}</Typography.Text>,
    })
  }

  if (!response?.status && !data?.error) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    })
  }

  throw error
}

/**
 * 全局 request 配置
 */
export const request: RequestConfig = {
  middlewares: [
    async (ctx: Context, next: () => void) => {
      // 以 SERVER_MODE 运行时，添加 auth header
      // 获取通知时，不需要 auth header
      if ((SERVER_MODE || isDevEnv()) && !ctx.req.url.includes('tcli.service')) {
        const res = await getAuthHeaderAsync()
        const { options } = ctx.req
        ctx.req.options = {
          ...options,
          headers: {
            ...options?.headers,
            'x-cloudbase-credentials': res['x-cloudbase-credentials'],
          },
        }
      }
      await next()
    },
  ],
  errorHandler,
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: !resData?.error,
        errorMessage: resData?.error?.message,
      }
    },
  },
  prefix: isDevEnv()
    ? defaultSettings.globalPrefix
    : SERVER_MODE
    ? `https://${window.TcbCmsConfig.containerAccessPath}${defaultSettings.globalPrefix}`
    : `https://${window.TcbCmsConfig.cloudAccessPath}${defaultSettings.globalPrefix}`,
}
