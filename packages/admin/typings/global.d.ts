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

interface MicroApp {
  /**
   * 微应用 id 全局唯一，英文字母
   */
  id: string

  /**
   * 名称
   */
  title: string

  /**
   * 文件 ID 列表
   */
  fileIDList: string

  /**
   * 自定义微应用的部署地址
   */
  deployUrl?: string
}

interface CustomMenuItem {
  /**
   * id
   */
  id: string

  /**
   * 菜单标题
   */
  title: string

  /**
   * 微应用 ID
   */
  microAppID?: string

  /**
   * 路径
   */
  link?: string

  /**
   * 根节点
   */
  root: string

  /**
   * 序列号
   */
  order: number

  /**
   * 子菜单
   */
  children: CustomMenuItem[]

  /**
   * 限定某些项目展示，默认为全部项目
   * [id]
   */
  applyProjects: string[]
}

/**
 * 全局配置
 */
interface GlobalSetting {
  /**
   * 小程序信息
   */
  miniappID?: string
  miniappName?: string
  miniappOriginalID?: string

  /**
   * 是否启用短信营销工具
   */
  enableOperation?: boolean

  /**
   * 短信活动渠道
   */
  activityChannels?: ActivityChannel[]

  /**
   * 微应用列表
   */
  microApps?: MicroApp[]

  /**
   * 微应用菜单信息
   */
  customMenus?: CustomMenuItem[]

  /**
   * 是否开启 restful api 访问
   */
  enableApiAccess?: boolean

  /**
   * restful api 访问路径
   */
  apiAccessPath?: string

  /**
   * 是否开启 API 鉴权
   */
  enableApiAuth?: boolean

  /**
   * API 访问 token
   */
  apiAuthTokens?: {
    id: string
    name: string
    token: string
    permissions: ('read' | 'modify' | 'delete')[]
  }[]
}

/**
 *  URL 参数
 */
interface UrlParams {
  schemaId: string
}

/**
 * 短信互动渠道
 */
interface ActivityChannel {
  value: string
  label: string
}

/**
 * window 变量
 */
interface Window {
  reloadAuthorized: () => void
  cloudbase: any
  TcbCmsConfig: ITcbCmsConfing
  tinymce: any
  cloud: any
  // 提供 CMS 方法给微应用使用
  TcbCmsInsRef: any
}
