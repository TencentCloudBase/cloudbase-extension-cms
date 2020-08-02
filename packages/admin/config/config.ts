// https://umijs.org/config/
import { defineConfig } from 'umi'
import defaultSettings from './defaultSettings'
import proxy from './proxy'

const { REACT_APP_ENV } = process.env

export default defineConfig({
    hash: true,
    antd: {},
    alias: {
        '@lang': '@/locales'
    },
    dva: {
        hmr: true
    },
    layout: {
        name: 'CloudBase CMS',
        locale: true,
        siderWidth: 208
    },
    locale: {
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        antd: true,
        baseNavigator: true
    },
    dynamicImport: {
        loading: '@/components/PageLoading/index'
    },
    targets: {
        ie: 11
    },
    // umi routes: https://umijs.org/docs/routing
    routes: [
        {
            path: '/',
            layout: false,
            component: './index'
        },
        {
            path: '/:projectId/home',
            name: 'overview',
            icon: 'eye',
            component: './Overview'
        },
        {
            path: '/:projectId/schema',
            name: 'schema',
            icon: 'gold',
            component: './schema/index'
        },
        {
            path: '/:projectId/content',
            name: 'content',
            icon: 'gold',
            component: './content/index'
        },
        // {
        //     path: '/:projectId/admin',
        //     name: 'admin',
        //     icon: 'crown',
        //     access: 'canAdmin',
        //     component: './Admin',
        //     routes: [
        //         {
        //             path: '/sub-page',
        //             name: 'sub-page',
        //             icon: 'smile',
        //             component: './Admin'
        //         }
        //     ]
        // },
        {
            path: '/user',
            layout: false,
            routes: [
                {
                    name: 'login',
                    path: '/user/login',
                    component: './user/login'
                }
            ]
        },
        {
            component: './404'
        }
    ],
    // Theme for antd: https://ant.design/docs/react/customize-theme-cn
    theme: {
        // ...darkTheme,
        'primary-color': defaultSettings.primaryColor
    },
    // @ts-ignore
    title: false,
    ignoreMomentLocale: true,
    proxy: proxy[REACT_APP_ENV || 'dev'],
    manifest: {
        basePath: '/'
    }
})
