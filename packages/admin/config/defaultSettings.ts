/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Settings as LayoutSettings } from '@ant-design/pro-layout'

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
  },
  title: 'CloudBase CMS',
  pwa: false,
  iconfontUrl: '',
  // 请求 prefix
  globalPrefix: '/api/v1',
} as LayoutSettings & {
  pwa: boolean
  globalPrefix: string
}
