import { defineConfig } from 'umi'
import defaultSettings from './defaultSettings'
import proxy from './proxy'

const { REACT_APP_ENV } = process.env

export default defineConfig({
  // base: '/tcb-cms/',
  // 静态资源路径
  publicPath: './',
  history: {
    type: 'hash',
  },
  hash: true,
  antd: {},
  alias: {
    '@lang': '@/locales',
  },
  dva: {
    hmr: true,
  },
  layout: {
    name: 'CloudBase CMS',
    locale: false,
    siderWidth: 208,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    title: false,
    baseNavigator: true,
    baseSeparator: '-',
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/login',
      layout: false,
      component: './login',
    },
    {
      path: '/home',
      layout: false,
      access: 'isLogin',
      component: './index',
    },
    {
      path: '/settings',
      layout: false,
      access: 'isAdmin',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './system/setting',
    },
    {
      path: '/settings/role/create',
      layout: false,
      access: 'isAdmin',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './system/setting/RoleCreating/index',
    },
    {
      path: '/:projectId/home',
      name: '概览',
      icon: 'eye',
      access: 'isLogin',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './project/overview',
    },
    {
      path: '/:projectId/schema',
      name: '内容模型',
      icon: 'gold',
      access: 'canSchema',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './project/schema/index',
      // routes: [
      //   {
      //     path: '/:projectId/schema/:schemaId',
      //     access: 'canSchema',
      //     component: './project/schema/index',
      //   },
      // ],
    },
    {
      path: '/:projectId/content',
      name: '内容集合',
      icon: 'database',
      access: 'canContent',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './project/content/index',
    },
    {
      path: '/:projectId/webhook',
      name: 'Webbook',
      icon: 'deployment-unit',
      access: 'canWebhook',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './project/webhook/index',
    },
    {
      path: '/:projectId/setting',
      name: '项目设置',
      icon: 'setting',
      access: 'canProjectAdmin',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './project/setting/index',
    },
    {
      path: '/',
      redirect: '/home',
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
})
