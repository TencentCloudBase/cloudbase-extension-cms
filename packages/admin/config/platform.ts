import { IConfig } from 'umi'

const { WX_MP, SERVER_MODE } = process.env

WX_MP && console.log('微信构建')

SERVER_MODE && console.log('容器服务模式构建')

const name = WX_MP ? '内容管理（CMS）' : 'CloudBase CMS'

const { REACT_APP_ENV } = process.env

/**
 * 和平台（小程序 OR 腾讯云）相关的一些配置
 */
const platformConfig: IConfig = {
  title: name,
  define: {
    WX_MP,
    SERVER_MODE,
    CMS_TITLE: name,
    ENV: REACT_APP_ENV,
    ICON_PATH: WX_MP ? 'icon-wx.svg' : 'icon.svg',
  },
  layout: {
    name: name,
  },
}

export default platformConfig
