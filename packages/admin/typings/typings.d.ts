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
declare module 'lodash.isequal'

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

  /**
   * 是否为小程序环境
   */
  isMpEnv: boolean

  /**
   * 是否为低码创建的 CMS
   */
  fromLowCode: boolean
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
  cloud: any
  // 禁用帮助按钮
}

declare let ga: Function

declare const WX_MP: boolean

declare const SERVER_MODE: boolean

declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false

declare module 'braft-utils'
