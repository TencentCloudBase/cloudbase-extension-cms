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
      component: './home/index',
    },
    {
      path: '/settings',
      layout: false,
      access: 'isAdmin',
      wrappers: ['../components/SecurityWrapper/index'],
      routes: [
        {
          path: '/settings',
          component: './system/setting',
        },
        {
          exact: true,
          path: '/settings/role/edit',
          component: './system/setting/RoleManagement/RoleEditor/index',
        },
        {
          exact: true,
          path: '/settings/microapp/edit',
          component: './system/setting/MicroApp/MicroAppEditor',
        },
      ],
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
      path: '/project/',
      component: '../layout/index',
      layout: false,
      routes: [
        {
          exact: true,
          path: '/project/home',
          name: '概览',
          icon: 'eye',
          access: 'isLogin',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/overview',
        },
        {
          exact: true,
          path: '/project/schema',
          name: '内容模型',
          icon: 'gold',
          access: 'canSchema',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/schema/index',
        },
        {
          path: '/project/content',
          name: '内容集合',
          icon: 'database',
          access: 'canContent',
          wrappers: ['../components/SecurityWrapper/index'],
          routes: [
            {
              exact: true,
              path: '/project/content/migrate',
              component: './project/migrate',
            },
            {
              exact: true,
              path: '/project/content/:schemaId',
              component: './project/content/index',
            },
            {
              exact: true,
              path: '/project/content/:schemaId/edit',
              component: './project/content/ContentEditor',
            },
            {
              component: './project/content/index',
            },
          ],
        },
        {
          path: '/project/operation',
          name: '营销工具',
          icon: 'shopping',
          access: 'canOperation',
          wrappers: ['../components/SecurityWrapper/index'],
          routes: [
            {
              exact: true,
              path: '/project/operation/activity',
              component: './project/operation/Activity/index',
            },
            {
              exact: true,
              path: '/project/operation/activity/edit',
              component: './project/operation/Activity/ActivityEditor',
            },
            {
              exact: true,
              path: '/project/operation/message',
              component: './project/operation/Message/index',
            },
            {
              exact: true,
              path: '/project/operation/analytics',
              component: './project/operation/Analytics/index',
            },
            {
              exact: true,
              path: '/project/operation/message/create',
              component: './project/operation/Message/TaskCreator',
            },
            {
              exact: true,
              path: '/project/operation/message/result',
              component: './project/operation/Message/TaskResult',
            },
            {
              component: './project/operation/index',
            },
          ],
        },
        {
          exact: true,
          path: '/project/webhook',
          name: 'Webhook',
          icon: 'deployment-unit',
          access: 'canWebhook',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/webhook/index',
        },
        {
          exact: true,
          path: '/project/setting',
          name: '项目设置',
          icon: 'setting',
          access: 'isAdmin',
          wrappers: ['../components/SecurityWrapper/index'],
          component: './project/setting/index',
        },
        // 所有的微应用
        {
          component: './project/microapp/index',
        },
      ],
    },
    {
      component: './404',
    },
  ],
}

export default routesConfig
