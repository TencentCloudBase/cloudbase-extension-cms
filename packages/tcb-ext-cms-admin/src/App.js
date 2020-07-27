import React from 'react'
import { Admin, Resource } from 'react-admin'
import polyglotI18nProvider from 'ra-i18n-polyglot'
import chineseMessages from 'ra-language-chinese'
import { createMuiTheme } from '@material-ui/core/styles'
import indigo from '@material-ui/core/colors/indigo'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { SnackbarProvider, useSnackbar } from 'notistack'

import CmsLayout from './components/CmsLayout'
import CmsMenu from './components/CmsMenu'
import IconComponentHOC from './components/IconComponentHOC'
import authProvider from './providers/authProvider'
import dataProviderWithHook from './providers/dataProvider'
import defaultConfig from './datamodel'

const contentsCollectionName = 'tcb-ext-cms-contents'

// 更改主题
const myTheme = createMuiTheme({
  palette: {
    secondary: indigo
  },
  typography: {
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Arial', 'sans-serif'].join(
      ','
    )
  }
})

// 本地化
chineseMessages.ra.page.empty = '还没有内容'
chineseMessages.ra.page.invite = '快来点击 “新建” 来创建第一条内容吧'
chineseMessages.ra.action.expand = '展开'
chineseMessages.ra.action.close = '关闭'
chineseMessages.ra.action.confirm = '确定'
chineseMessages.ra.action.unselect = '取消'

const i18nProvider = polyglotI18nProvider(() => chineseMessages, 'cn')

const App = () => {
  const { enqueueSnackbar } = useSnackbar()
  const dataProvider = dataProviderWithHook((operate, resource) => {
    // 统一回调
    if (resource === 'tcb-ext-cms-contents' && ['create', 'update', 'delete'].includes(operate)) {
      enqueueSnackbar('内容建模设置已更新，将会自动刷新页面更新最新管理界面', {
        variant: 'info',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })
      setTimeout(() => window.location.reload(), 2500)
    }
  })

  return (
    <Admin
      title="云开发CMS内容管理系统扩展"
      i18nProvider={i18nProvider}
      authProvider={authProvider}
      dataProvider={dataProvider}
      theme={myTheme}
      layout={CmsLayout}
      menu={CmsMenu}
    >
      {fetchRemote}
    </Admin>
  )
}

const Empty = () => (
  <Box textAlign="center" m={1}>
    <Typography variant="h5" paragraph>
      内容设置为空，请联系你的 CMS 系统管理员进行内容配置
    </Typography>
  </Box>
)

const fetchRemote = async (permissions) => {
  try {
    await authProvider.checkAuth()
  } catch (e) {
    window.location.hash = '#/login'
  }
  const [res, { ResourceComponentsFactory }] = await Promise.all([
    dataProviderWithHook().getList(contentsCollectionName, {
      filter: {},
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'order', order: 'DESC' }
    }),
    import('./components/resources')
  ])

  window.cmsConfig = {
    defaultConfig,
    resourceConfig: res.data,
    resourceIndexById: res.data.reduce((prev, cur) => {
      prev[cur._id] = cur
      return prev
    }, {}),
    resourceIndexByCollectionName: res.data.reduce((prev, cur) => {
      prev[cur.collectionName] = cur
      return prev
    }, {})
  }

  const config = [
    ...(permissions === 'administrator' ? defaultConfig : []),
    ...res.data.filter((resourceConfig) => resourceConfig.collectionName && resourceConfig.label)
  ]

  if (!config.length) return [<Empty />]

  return config.map((collectionConfig) => {
    const resourceComponents = ResourceComponentsFactory(collectionConfig)
    const { ListComponent, EditComponent, CreateComponent, ShowComponent } = resourceComponents
    const { collectionName, label, icon, group = '运营' } = collectionConfig

    return (
      <Resource
        name={collectionName}
        options={{ label, group }}
        show={ShowComponent}
        list={ListComponent}
        edit={EditComponent}
        create={CreateComponent}
        icon={IconComponentHOC(icon)}
      />
    )
  })
}

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <App />
    </SnackbarProvider>
  )
}
