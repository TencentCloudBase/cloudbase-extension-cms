declare module 'slash2'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'
declare module 'omit.js'

// google analytics interface
interface GAFieldsObject {
  eventCategory: string
  eventAction: string
  eventLabel?: string
  eventValue?: number
  nonInteraction?: boolean
}
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
  // 产品名
  appName: string
}

interface Window {
  ga: (
    command: 'send',
    hitType: 'event' | 'pageview',
    fieldsObject: GAFieldsObject | string
  ) => void
  reloadAuthorized: () => void
  cloudbase: any
  TcbCmsConfig: ITcbCmsConfing
  tinymce: any
  // 禁用帮助按钮
}

declare let ga: Function

declare const WX_MP: boolean

declare const SERVER_MODE: boolean

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false

declare module 'braft-utils'
