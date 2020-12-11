import { Spin } from 'antd'
import React, { useEffect, useMemo } from 'react'
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
} from '@ant-design/icons'
import { useConcent } from 'concent'
import { ContentCtx } from 'typings/store'
import { getCmsConfig } from '@/utils'
import defaultSettings from '../../config/defaultSettings'

// 设置图标颜色
setTwoToneColor('#0052d9')

const customMenuDate: MenuDataItem[] = [
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
    authority: 'canWebhook',
    path: '/:projectId/webhook',
    name: 'Webbook',
    icon: <RocketTwoTone />,
  },
  {
    authority: 'isAdmin',
    path: '/:projectId/setting',
    name: '项目设置',
    icon: <SettingTwoTone />,
  },
]

const layoutProps: BasicLayoutProps = {
  theme: 'light',
  navTheme: 'light',
  headerHeight: 64,
  disableContentMargin: true,
  logo: getCmsConfig('cmsLogo'),
  rightContentRender: () => <RightContent />,
  headerTitleRender: ({ collapsed }) => <HeaderTitle collapsed={Boolean(collapsed)} />,
  // 面包屑渲染
  itemRender: () => null,
  ...defaultSettings,
}

const Layout: React.FC<any> = (props) => {
  const access = useAccess()
  const { children, location } = props
  const ctx = useConcent<{}, ContentCtx>('content')
  const { schemas, loading } = ctx.state

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

  const contentChildMenus = useMemo(
    () =>
      schemas?.map((schema: Schema) => ({
        name: schema.displayName,
        path: `/:projectId/content/${schema._id}`,
      })),
    [schemas]
  )

  return (
    <ProLayout
      // 不自动折叠菜单
      openKeys={false}
      location={location}
      menuContentRender={(_, dom) =>
        loading ? (
          <div
            style={{
              margin: '24px 0',
              textAlign: 'center',
            }}
          >
            <Spin tip="数据加载中" />
          </div>
        ) : (
          dom
        )
      }
      menuDataRender={(menuData: MenuDataItem[]) => {
        customMenuDate[2].children = contentChildMenus
        return customMenuDate.filter((_) => access[_.authority as string])
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

export default Layout
