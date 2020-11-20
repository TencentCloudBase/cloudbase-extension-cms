import { IConfig } from 'umi'

const { WX_MP } = process.env

const name = WX_MP ? '内容管理（CMS）' : 'CloudBase CMS'

/**
 * 和平台（小程序 OR 腾讯云）相关的一些配置
 */
const platformConfig: IConfig = {
  title: name,
  define: {
    WX_MP,
    CMS_TITLE: name,
    ICON_PATH: WX_MP ? 'icon-wx.svg' : 'icon.svg',
  },
  layout: {
    name: name,
  },
}

export default platformConfig
