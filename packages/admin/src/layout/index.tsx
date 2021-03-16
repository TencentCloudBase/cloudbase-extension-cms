import React, { useEffect, useState } from 'react'
import { history, Link, matchPath, useAccess } from 'umi'
import HeaderTitle from '@/components/HeaderTitle'
import RightContent from '@/components/RightContent'
import ProLayout, { MenuDataItem, BasicLayoutProps } from '@ant-design/pro-layout'
import {
  EyeTwoTone,
  GoldTwoTone,
  DatabaseTwoTone,
  SettingTwoTone,
  RocketTwoTone,
  setTwoToneColor,
  ShoppingTwoTone,
} from '@ant-design/icons'
import { useConcent } from 'concent'
import { ContentCtx, GlobalCtx } from 'typings/store'
import { getCmsConfig } from '@/utils'
import defaultSettings from '../../config/defaultSettings'
import { Spin } from 'antd'

// 设置图标颜色
setTwoToneColor('#0052d9')

const customMenuData: MenuDataItem[] = [
  {
    authority: 'isLogin',
    path: '/:projectId/home',
    name: '概览',
    icon: <EyeTwoTone />,
  },
  {
    authority: 'canSchema',
    path: '/:projectId/schema',
    name: '内容模型',
    icon: <GoldTwoTone />,
  },
  {
    authority: 'canContent',
    path: '/:projectId/content',
    name: '内容集合',
    icon: <DatabaseTwoTone />,
    children: [],
  },
  {
    name: '微应用',
    icon: <RocketTwoTone />,
    authority: 'isLogin',
    path: '/:projectId/microapp',
    children: [
      {
        name: '页面 1',
        path: '/:projectId/microapp/app',
      },
    ],
  },
  {
    authority: 'canWebhook',
    path: '/:projectId/webhook',
    name: 'Webhook',
    icon: <RocketTwoTone />,
    children: [],
  },
  {
    authority: 'isAdmin',
    path: '/:projectId/setting',
    name: '项目设置',
    icon: <SettingTwoTone />,
  },
]

// 微信侧才支持发送短信的功能
if (WX_MP || window.TcbCmsConfig.isMpEnv) {
  customMenuData.splice(3, 0, {
    authority: 'canContent',
    path: '/:projectId/operation',
    name: '营销工具',
    icon: <ShoppingTwoTone />,
    children: [],
  })
}

const layoutProps: BasicLayoutProps = {
  theme: 'light',
  navTheme: 'light',
  headerHeight: 64,
  disableContentMargin: true,
  logo: getCmsConfig('cmsLogo'),
  rightContentRender: () => <RightContent />,
  headerTitleRender: (logo, title, { collapsed }) => <HeaderTitle collapsed={Boolean(collapsed)} />,
  // 面包屑渲染
  itemRender: () => null,
  ...defaultSettings,
}

const Layout: React.FC<any> = (props) => {
  const access = useAccess()
  const { children, location } = props
  const [refresh, setRefresh] = useState({ n: 1 })
  const ctx = useConcent<{}, ContentCtx>('content')
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { schemas, loading } = ctx.state
  const { setting = {} } = globalCtx.state

  // 加载 schema 集合
  useEffect(() => {
    // 匹配 Path，获取 projectId
    const match = matchPath<{ projectId?: string }>(history.location.pathname, {
      path: '/:projectId/*',
      exact: true,
      strict: false,
    })

    // projectId 无效时，重定向到首页
    const { projectId = '' } = match?.params || {}
    if (projectId === ':projectId' || !projectId) {
      history.push('/home')
      return
    }

    ctx.mr.getContentSchemas(projectId)
  }, [])

  // 内容集合菜单
  const contentChildMenus = schemas?.map((schema: Schema) => ({
    name: schema.displayName,
    path: `/:projectId/content/${schema._id}`,
  }))

  // HACK: 强制菜单重新渲染，修复菜单栏在获取数据后不自动渲染的问题
  useEffect(() => {
    setRefresh({
      n: refresh.n + 1,
    })
  }, [customMenuData, loading, schemas, setting])

  // 添加菜单
  useEffect(() => {
    // 是否开启了营销工具
    if (window.TcbCmsConfig.isMpEnv && setting?.enableOperation) {
      if (!customMenuData[3].children?.length) {
        customMenuData[3].children = [
          {
            name: '营销活动',
            path: '/:projectId/operation/activity',
            component: './project/operation/Activity/index',
          },
          {
            name: '发送短信',
            path: '/:projectId/operation/message',
            component: './project/operation/Message/index',
          },
          {
            name: '统计分析',
            path: '/:projectId/operation/analytics',
            component: './project/operation/Analytics/index',
          },
        ]
      }
    }
  }, [setting])

  return (
    <ProLayout
      route={refresh}
      // 不自动折叠菜单
      openKeys={false}
      location={location}
      menuContentRender={(_, dom) => contentLoading({ dom, loading })}
      menuDataRender={(menuData: MenuDataItem[]) => {
        customMenuData[2].children = contentChildMenus
        return customMenuData.filter((_) => access[_.authority as string])
      }}
      menuItemRender={(menuItemProps, defaultDom) => {
        const match = matchPath<{ projectId?: string }>(history.location.pathname, {
          path: '/:projectId/*',
          exact: true,
          strict: false,
        })

        // 项目 Id
        const { projectId = '' } = match?.params || {}

        if (menuItemProps.isUrl || menuItemProps.children) {
          return defaultDom
        }

        if (menuItemProps.path) {
          return (
            <Link
              to={menuItemProps.path.replace(':projectId', projectId)}
              onClick={() => {
                // 清空搜索数据
                ctx.setState({
                  searchFields: [],
                  searchParams: {},
                })
              }}
            >
              {defaultDom}
            </Link>
          )
        }

        return defaultDom
      }}
      {...layoutProps}
    >
      {children}
    </ProLayout>
  )
}

const contentLoading = ({
  dom,
  loading,
}: {
  dom: React.ReactNode
  loading: Boolean
}): React.ReactNode =>
  loading ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '48px 0',
      }}
    >
      <Spin tip="加载中" />
    </div>
  ) : (
    dom
  )

export default Layout
