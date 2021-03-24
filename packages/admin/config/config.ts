import { defineConfig, IConfig } from 'umi'
import defaultSettings from './defaultSettings'
import platformConfig from './platform'
import routesConfig from './routes'
import proxy from './proxy'

const { REACT_APP_ENV } = process.env

const config: IConfig = {
  base: '/',
  // 静态资源路径
  publicPath: './',
  history: {
    // 静态托管部署，需要使用 hash 模式
    type: 'hash',
  },
  // 是否让生成的文件包含 hash 后缀
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    name: platformConfig.layout.name,
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
    loading: '@/components/Loading/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // 路由配置
  routes: routesConfig.routes,
  // 主题配置 for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
    'border-radius-base': '3px',
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  extraPostCSSPlugins: [
    // eslint-disable-next-line
    require('postcss-import'),
    // eslint-disable-next-line
    require('tailwindcss'),
    // eslint-disable-next-line
    require('autoprefixer'),
  ],
  // 定义变量
  define: {
    ...platformConfig.define,
  },
  // 微前端
  qiankun: {
    master: {} as any,
  },
  mountElementId: 'root',
}

// webpack chunk 合并
if (REACT_APP_ENV !== 'dev') {
  config.chunks = ['vendors', 'umi']
  config.chainWebpack = function (config, { webpack }) {
    config.merge({
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          minChunks: 3,
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test({ resource }: any) {
                return /[\\/]node_modules[\\/]/.test(resource)
              },
              priority: 10,
            },
          },
        },
      },
    })
  }
}

export default defineConfig(config)
