import React, { useState, useEffect } from 'react'
import ProLayout from '@ant-design/pro-layout'
import HeaderTitle from '@/components/HeaderTitle'
import { Link, useModel, history, useIntl } from 'umi'
import { getMatchMenu, MenuDataItem, transformRoute } from '@umijs/route-utils'
import { getMenuData } from '@/routes'
import ErrorBoundary from '../components/ErrorBoundary'
import { WithExceptionOpChildren } from '../components/Exception'
import renderRightContent from './renderRightContent'
import './style.less'

const getLayoutRender = (currentPathConfig: {
    layout:
        | {
              hideMenu: boolean
              hideNav: boolean
              hideFooter: boolean
          }
        | false
    hideFooter: boolean
}) => {
    const layoutRender: any = {}

    if (currentPathConfig?.hideFooter) {
        layoutRender.footerRender = false
    }

    if (currentPathConfig?.layout === false) {
        layoutRender.pure = true
        return layoutRender
    }

    if (currentPathConfig?.layout?.hideMenu) {
        layoutRender.menuRender = false
    }

    if (currentPathConfig?.layout?.hideFooter) {
        layoutRender.footerRender = false
    }

    if (currentPathConfig?.layout?.hideNav) {
        layoutRender.headerRender = false
    }

    return layoutRender
}

const BasicLayout = (props: any) => {
    const { children, userConfig = {}, location, route, ...restProps } = props
    const paths = history.location.pathname.split('/').filter((_: string) => _)
    const projectId = paths[0]

    const initialInfo = useModel?.('@@initialState') || {
        initialState: undefined,
        loading: false,
        setInitialState: null
    } // plugin-initial-state 未开启
    const { initialState, loading, setInitialState } = initialInfo
    // 国际化插件并非默认启动
    const intl = useIntl?.()

    const [currentPathConfig, setCurrentPathConfig] = useState<MenuDataItem>({})

    useEffect(() => {
        const { menuData } = transformRoute(props?.route?.routes || [], undefined, undefined, true)
        // 动态路由匹配
        const currentPathConfig = getMatchMenu(location.pathname, menuData).pop()
        setCurrentPathConfig(currentPathConfig || {})
    }, [location.pathname])
    // layout 是否渲染相关

    const layoutRestProps = {
        ...userConfig,
        ...restProps,
        ...getLayoutRender(currentPathConfig as any)
    }

    return (
        <ProLayout
            fixSiderbar
            fixedHeader
            disableContentMargin
            layout="mix"
            route={route}
            location="/"
            navTheme="light"
            siderWidth={256}
            title="CloudBase CMS"
            className="umi-plugin-layout-main"
            headerTitleRender={HeaderTitle}
            onMenuHeaderClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                history.push('/')
            }}
            menu={{ locale: userConfig.locale }}
            logo="/img/logo.png"
            formatMessage={intl?.formatMessage}
            menuDataRender={() => getMenuData(projectId)}
            menuItemRender={(menuItemProps, defaultDom) => {
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
            }}
            {...layoutRestProps}
            rightContentRender={
                // === false 应该关闭这个功能
                layoutRestProps?.rightContentRender !== false &&
                ((layoutProps) => {
                    const dom = renderRightContent(
                        userConfig,
                        loading,
                        initialState,
                        setInitialState
                    )
                    if (layoutRestProps.rightContentRender) {
                        return layoutRestProps.rightContentRender(layoutProps, dom, {
                            userConfig,
                            loading,
                            initialState,
                            setInitialState
                        })
                    }
                    return dom
                })
            }
        >
            <ErrorBoundary>
                <WithExceptionOpChildren currentPathConfig={currentPathConfig}>
                    {userConfig.childrenRender ? userConfig.childrenRender(children) : children}
                </WithExceptionOpChildren>
            </ErrorBoundary>
        </ProLayout>
    )
}

export default BasicLayout
