import { IConfig } from 'umi'

const routesConfig: IConfig = {
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
      path: '/settings/role/edit',
      layout: false,
      access: 'isAdmin',
      wrappers: ['../components/SecurityWrapper/index'],
      component: './system/setting/RoleEditor/index',
    },
    {
      path: '/',
      exact: true,
      redirect: '/home',
    },
    {
      path: '/redirect',
      exact: true,
      component: './redirect',
    },
    {
      component: '../layout/index',
      layout: false,
      routes: [
        {
          exact: true,
          path: '/:projectId/home',
          name: '概览',
          icon: 'eye',
          access: 'isLogin',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/overview',
        },
        {
          exact: true,
          path: '/:projectId/schema',
          name: '内容模型',
          icon: 'gold',
          access: 'canSchema',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/schema/index',
        },
        {
          path: '/:projectId/content',
          name: '内容集合',
          icon: 'database',
          access: 'canContent',
          wrappers: ['../components/SecurityWrapper/index'],
          routes: [
            {
              exact: true,
              path: '/:projectId/content/migrate',
              component: './project/migrate',
            },
            {
              exact: true,
              path: '/:projectId/content/:schemaId',
              component: './project/content/index',
            },
            {
              exact: true,
              path: '/:projectId/content/:schemaId/edit',
              component: './project/content/ContentEditor',
            },
            {
              component: './project/content/index',
            },
          ],
        },
        {
          exact: true,
          path: '/:projectId/webhook',
          name: 'Webhook',
          icon: 'deployment-unit',
          access: 'canWebhook',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/webhook/index',
        },
        {
          exact: true,
          path: '/:projectId/setting',
          name: '项目设置',
          icon: 'setting',
          access: 'isAdmin',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/setting/index',
        },
      ],
    },
    {
      component: './404',
    },
  ],
}

export default routesConfig
