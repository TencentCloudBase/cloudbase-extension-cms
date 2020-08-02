import React from 'react'
import { run } from 'concent'
import { notification } from 'antd'
import { history, RequestConfig, Link } from 'umi'
import { ResponseError } from 'umi-request'
import HeaderTitle from '@/components/HeaderTitle'
import RightContent from '@/components/RightContent'
import { BasicLayoutProps, Settings as LayoutSettings } from '@ant-design/pro-layout'
import { queryCurrent } from './services/user'
import defaultSettings from '../config/defaultSettings'
import * as models from './models'
import { getCloudBaseApp } from './utils'

run(models)

export async function getInitialState(): Promise<{
    currentUser?: API.CurrentUser
    settings?: LayoutSettings
}> {
    const app = await getCloudBaseApp()

    // console.log(app.auth())

    // 如果是登录页面，不执行
    if (history.location.pathname !== '/user/login') {
        try {
            const currentUser = await queryCurrent()
            return {
                currentUser,
                settings: defaultSettings
            }
        } catch (error) {
            history.push('/user/login')
        }
    }
    return {
        settings: defaultSettings
    }
}

export const layout = ({
    initialState
}: {
    initialState: { settings?: LayoutSettings }
}): BasicLayoutProps => {
    return {
        disableContentMargin: false,
        rightContentRender: () => <RightContent />,
        menuItemRender: (menuItemProps, defaultDom) => {
            const paths = history.location.pathname.split('/').filter((_: string) => _)
            const projectId = paths[0]

            if (menuItemProps.isUrl || menuItemProps.children) {
                return defaultDom
            }

            if (menuItemProps.path) {
                return (
                    <Link to={menuItemProps.path.replace(':projectId', projectId)}>
                        {defaultDom}
                    </Link>
                )
            }

            return defaultDom
        },
        headerTitleRender: ({ collapsed }) => <HeaderTitle collapsed={Boolean(collapsed)} />,
        ...initialState?.settings
    }
}

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    405: '请求方法不被允许。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。'
}

/**
 * 异常处理程序
 */
const errorHandler = (error: ResponseError) => {
    const { response } = error
    if (response?.status) {
        const errorText = codeMessage[response.status] || response.statusText
        const { status, url } = response

        notification.error({
            message: `请求错误 ${status}: ${url}`,
            description: errorText
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

export const request: RequestConfig = {
    errorHandler,
    errorConfig: {
        adaptor: (resData) => {
            return {
                ...resData,
                success: !resData.code,
                errorMessage: resData.message
            }
        }
    },
    responseInterceptors: [
        async (response, options) => {
            const data = await response.clone().json()
            if (data.code) {
                notification.error({
                    message: data.message || data.code,
                    description: data.requestId
                        ? `${data.code}\n[requestId]${data.requestId}`
                        : data.code
                })
            }

            return response
        }
    ]
}
