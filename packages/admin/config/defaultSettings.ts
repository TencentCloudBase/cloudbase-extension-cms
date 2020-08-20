/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Settings as LayoutSettings } from '@ant-design/pro-layout'

export default {
  navTheme: 'light',
  // 拂晓蓝
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
} as LayoutSettings & {
  pwa: boolean
}
