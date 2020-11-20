/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Settings as LayoutSettings } from '@ant-design/pro-layout'
import platformConfig from './platform'

export default {
  navTheme: 'light',
  primaryColor: '#0052d9',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: false,
    defaultOpenAll: true,
  },
  title: platformConfig.title,
  pwa: false,
  iconfontUrl: '',
  // 请求 prefix
  globalPrefix: '/api/v1.0',
} as LayoutSettings & {
  pwa: boolean
  globalPrefix: string
}
