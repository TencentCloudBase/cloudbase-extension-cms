import React from 'react'
import { run } from 'concent'
import { notification, message, Typography } from 'antd'
import { Context, ResponseError } from 'umi-request'
import { history, RequestConfig } from 'umi'
import { codeMessage } from '@/constants'
import { BasicLayoutProps, Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout'
import { getCurrentUser } from './services/apis'
import defaultSettings from '../config/defaultSettings'
import { isDevEnv, getLoginState, getHttpAccessPath, getAuthHeaderAsync } from './utils'
import * as models from './models'
import { getSetting } from './services/global'

run(models)

export async function getInitialState(): Promise<{
  currentUser?: Partial<CurrentUser>
  settings?: LayoutSettings
  menu?: any[]
}> {
  let loginState

  try {
    // 获取登录态
    loginState = await getLoginState()
  } catch (error) {
    console.log(error)
    message.error(`CloudBase JS SDK 初始化失败，${error?.message}`)
  }

  // 没有登录，重新登录
  if (!isDevEnv() && !loginState) {
    history.push('/login')
    message.error('您还没有登录或登录已过期，请登录后再操作！')
    // 移除 loading 元素
    document.getElementById('loading')?.remove()
    return {}
  }

  let initialState: {
    menu?: MenuDataItem[]
    currentUser?: Partial<CurrentUser>
    settings?: LayoutSettings
  } = {}
  let currentUser = {} as any

  // 获取用户信息
  try {
    currentUser = await getCurrentUser()
  } catch (e) {
    console.log(e)
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
  initialState: { menu?: MenuDataItem[]; settings?: LayoutSettings; currentUser?: CurrentUser }
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
  prefix: getHttpAccessPath(),
}

/**
 * 注册微应用
 */
export const qiankun = async () => {
  const isLogin = await getLoginState()

  // 未登录时返回空配置
  if (!isLogin) {
    return {
      apps: [],
    }
  }

  // 加载应用信息
  try {
    const { data } = await getSetting()
    const microApps = data.microApps || []

    return {
      // 注册子应用信息
      apps: microApps.map((app) => ({
        name: app.id,
        entry: `https://${location.host}/cloudbase-cms/apps/${app.id}/index.html`,
      })),
      // 完整生命周期钩子请看 https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles
      lifeCycles: {
        afterMount: (props: any) => {
          console.log(props)
        },
      },
      // 支持更多的其他配置，详细看这里 https://qiankun.umijs.org/zh/api/#start-opts
    }
  } catch (e) {
    console.log(e)

    return {
      apps: [],
    }
  }
}
