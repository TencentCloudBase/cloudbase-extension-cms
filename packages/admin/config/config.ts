import { defineConfig } from 'umi'
import defaultSettings from './defaultSettings'
import proxy from './proxy'

const { REACT_APP_ENV } = process.env

export default defineConfig({
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
        locale: true,
        siderWidth: 208,
    },
    locale: false,
    // locale: {
    //     // default zh-CN
    //     default: 'zh-CN',
    //     // default true, when it is true, will use `navigator.language` overwrite default
    //     antd: true,
    //     baseNavigator: true
    // },
    dynamicImport: {
        loading: '@/components/PageLoading/index',
    },
    targets: {
        ie: 11,
    },
    // umi routes: https://umijs.org/docs/routing
    routes: [
        {
            path: '/',
            layout: false,
            access: 'isLogin',
            component: './index',
        },
        {
            path: '/settings',
            layout: false,
            access: 'canAdmin',
            component: './system-setting',
        },
        {
            path: '/login',
            layout: false,
            component: './login',
        },
        {
            path: '/:projectId',
            access: 'isLogin',
            routes: [
                {
                    path: '/:projectId/home',
                    name: '概览',
                    icon: 'eye',
                    access: 'isLogin',
                    component: './project/overview',
                },
                {
                    path: '/:projectId/schema',
                    name: '内容原型',
                    icon: 'gold',
                    component: './project/schema/index',
                },
                {
                    path: '/:projectId/content',
                    name: '内容集合',
                    icon: 'database',
                    component: './project/content/index',
                },
                {
                    path: '/:projectId/webhook',
                    name: 'Webbook',
                    icon: 'deployment-unit',
                    access: 'canAdmin',
                    component: './project/webhook/index',
                },
                {
                    path: '/:projectId/setting',
                    name: '项目设置',
                    icon: 'setting',
                    access: 'canAdmin',
                    component: './project/setting/index',
                },
            ],
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
