import { Spin } from 'antd'
import React from 'react'
import { history, Link, useRequest, matchPath } from 'umi'
import HeaderTitle from '@/components/HeaderTitle'
import RightContent from '@/components/RightContent'
import defaultSettings from '../../config/defaultSettings'
import ProLayout, { MenuDataItem, BasicLayoutProps } from '@ant-design/pro-layout'
import {
  EyeTwoTone,
  GoldTwoTone,
  DatabaseTwoTone,
  SettingTwoTone,
  RocketTwoTone,
} from '@ant-design/icons'
import { getContentSchemas } from '@/services/content'
import { useConcent } from 'concent'

const customMenuDate: MenuDataItem[] = [
  {
    path: '/:projectId/home',
    name: '概览',
    icon: <EyeTwoTone />,
  },
  {
    path: '/:projectId/schema',
    name: '内容模型',
    icon: <GoldTwoTone />,
  },
  {
    path: '/:projectId/content',
    name: '内容集合',
    icon: <DatabaseTwoTone />,
    children: [],
  },
  {
    path: '/:projectId/webhook',
    name: 'Webbook',
    icon: <RocketTwoTone />,
  },
  {
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
  rightContentRender: () => <RightContent />,
  headerTitleRender: ({ collapsed }) => <HeaderTitle collapsed={Boolean(collapsed)} />,
  menuItemRender: (menuItemProps, defaultDom) => {
    const match = matchPath<{ projectId?: string }>(history.location.pathname, {
      path: '/:projectId/*',
      exact: true,
      strict: false,
    })
    const { projectId = '' } = match?.params || {}

    if (menuItemProps.isUrl || menuItemProps.children) {
      return defaultDom
    }

    if (menuItemProps.path) {
      return <Link to={menuItemProps.path.replace(':projectId', projectId)}>{defaultDom}</Link>
    }

    return defaultDom
  },
  // 面包屑渲染
  itemRender: () => null,
  ...defaultSettings,
}

const Layout: React.FC<any> = (props) => {
  console.log(props)
  const { children, location } = props
  const ctx = useConcent('content')

  // 加载 content 集合
  const { data: schemas, loading } = useRequest(async () => {
    const match = matchPath<{ projectId?: string }>(history.location.pathname, {
      path: '/:projectId/*',
      exact: true,
      strict: false,
    })

    const { projectId = '' } = match?.params || {}
    const res = await getContentSchemas(projectId)

    // 设置 schemas 数据
    ctx.setState({
      schemas: res.data,
    })

    return res
  })

  const contentChildMenus = schemas?.map((schema: SchemaV2) => ({
    name: schema.displayName,
    path: `/:projectId/content/${schema._id}`,
  }))

  return (
    <ProLayout
      location={location}
      menuContentRender={(_, dom) =>
        loading ? (
          <div
            style={{
              margin: '24px 0',
              textAlign: 'center',
            }}
          >
            <Spin tip="菜单加载中" />
          </div>
        ) : (
          dom
        )
      }
      menuDataRender={(menuData: MenuDataItem[]) => {
        customMenuDate[2].children = contentChildMenus
        return customMenuDate
      }}
      {...layoutProps}
    >
      {children}
    </ProLayout>
  )
}

export default Layout