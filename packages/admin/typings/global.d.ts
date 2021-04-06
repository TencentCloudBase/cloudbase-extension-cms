/**
 * CMS 动态配置
 */
interface ITcbCmsConfing {
  // 可用区
  region: string
  // 路由模式
  history: 'hash' | 'browser'
  // 环境 Id
  envId: string
  // 云接入域名
  cloudAccessPath: string
  // 容器模式时的路径
  containerAccessPath: string
  // 禁用帮助按钮
  disableHelpButton: boolean
  // 禁用通知提示
  disableNotice: boolean
  // 微信小程序 AppId
  mpAppID: string
  // CMS 文案配置
  cmsTitle: string
  // Logo 图片
  cmsLogo: string
  // 文档链接
  cmsDocLink: string
  // 帮助链接
  cmsHelpLink: string
  // 产品官网链接
  officialSiteLink: string

  /**
   * 产品名
   */
  appName: string

  /**
   * 是否为小程序环境
   */
  isMpEnv: boolean

  /**
   * 是否为低码创建的 CMS
   */
  fromLowCode: boolean

  /**
   * 分组信息
   * default: '我的应用'
   * datasource: '我的数据源'
   */
  groups: {
    key: string
    title: string
  }[]
}

interface Window {
  reloadAuthorized: () => void
  cloudbase: any
  TcbCmsConfig: ITcbCmsConfing
  tinymce: any
  cloud: any
}
