import { Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import { history, Link, useAccess } from 'umi'
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
  AppstoreTwoTone,
} from '@ant-design/icons'
import { useConcent } from 'concent'
import { ContentCtx, GlobalCtx } from 'typings/store'
import { getCmsConfig, getProjectId } from '@/utils'
import defaultSettings from '../../config/defaultSettings'

// 设置图标颜色
setTwoToneColor('#0052d9')

const systemMenuData: MenuDataItem[] = [
  {
    authority: 'isLogin',
    path: '/project/home',
    name: '概览',
    icon: <EyeTwoTone />,
  },
  {
    authority: 'canSchema',
    path: '/project/schema',
    name: '内容模型',
    icon: <GoldTwoTone />,
  },
  {
    authority: 'canContent',
    path: '/project/content',
    name: '内容集合',
    icon: <DatabaseTwoTone />,
    children: [],
  },
  {
    authority: 'canWebhook',
    path: '/project/webhook',
    name: 'Webhook',
    icon: <RocketTwoTone />,
    children: [],
  },
  {
    authority: 'isAdmin',
    path: '/project/setting',
    name: '项目设置',
    icon: <SettingTwoTone />,
  },
]

// 微信侧才支持发送短信的功能
if (WX_MP || window.TcbCmsConfig.isMpEnv) {
  systemMenuData.splice(3, 0, {
    authority: 'canContent',
    path: '/project/operation',
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
    // projectId 无效时，重定向到首页
    const projectId = getProjectId()

    if (projectId === 'project' || !projectId) {
      history.push('/home')
      return
    }

    ctx.mr.getContentSchemas(projectId)
  }, [])

  // 内容集合菜单
  const contentChildMenus = schemas?.map((schema: Schema) => ({
    name: schema.displayName,
    path: `/project/content/${schema._id}`,
  }))

  // HACK: 强制菜单重新渲染，修复菜单栏在获取数据后不自动渲染的问题
  useEffect(() => {
    setRefresh({
      n: refresh.n + 1,
    })
  }, [systemMenuData, loading, schemas, setting])

  // 添加菜单
  useEffect(() => {
    // 是否开启了营销工具
    if (window.TcbCmsConfig.isMpEnv && setting?.enableOperation) {
      if (!systemMenuData[3].children?.length) {
        systemMenuData[3].children = [
          {
            name: '营销活动',
            path: '/project/operation/activity',
            component: './project/operation/Activity/index',
          },
          {
            name: '发送短信',
            path: '/project/operation/message',
            component: './project/operation/Message/index',
          },
          {
            name: '统计分析',
            path: '/project/operation/analytics',
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
        systemMenuData[2].children = contentChildMenus

        // 将自定义菜单添加到 Webhook 菜单前
        const { customMenus } = setting
        if (customMenus?.length) {
          // 循环判断菜单是否存在，不存在则插入菜单
          // 保持菜单的原有顺序插入
          const baseInsertIndex = WX_MP || window.TcbCmsConfig.isMpEnv ? 6 : 5
          customMenus.forEach((menu, index) => {
            const isCustomMenusInsert = systemMenuData.find((_) => _?.key === menu.id)
            if (!isCustomMenusInsert) {
              const customMenuData = mapCustomMenuTree(menu)
              systemMenuData.splice(baseInsertIndex + index, 0, customMenuData)
            }
          })
        }

        return systemMenuData.filter((_) => access[_.authority as string])
      }}
      menuItemRender={(menuItemProps, defaultDom) => {
        const projectId = getProjectId()

        if (menuItemProps.children) {
          return defaultDom
        }

        // 链接菜单，外跳
        if (menuItemProps.isUrl) {
          return (
            <Link
              to={menuItemProps.itemPath}
              target="_blank"
              onClick={() => {
                console.log('click')
              }}
            >
              {defaultDom}
            </Link>
          )
        }

        // 跳转路径
        if (menuItemProps.path) {
          const menuPath = menuItemProps.path?.includes('?pid')
            ? menuItemProps.path
            : menuItemProps.path + `?pid=${projectId}`

          return (
            <Link
              to={menuPath}
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

/**
 * 遍历菜单配置树，生成菜单树
 */
const mapCustomMenuTree = (node: CustomMenuItem): any => {
  if (!node.children?.length) {
    return {
      key: node.id,
      authority: 'isLogin',
      name: node.title,
      path: node.microAppID ? `/project/microapp/${node.microAppID}` : node.link,
      component: './project/microapp/index',
      children: [],
      icon: <AppstoreTwoTone />,
    }
  } else {
    return {
      key: node.id,
      authority: 'isLogin',
      name: node.title,
      path: node.microAppID ? `/project/microapp/${node.microAppID}` : node.link,
      component: './project/microapp/index',
      children: node.children.map((_) => mapCustomMenuTree(_)),
      icon: <AppstoreTwoTone />,
    }
  }
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
