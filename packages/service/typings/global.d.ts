import { Request, Response } from 'express'

declare global {
  export interface IRequest extends Request {
    handleService: string

    cmsUser: RequestUser
  }
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

interface ActivityChannel {
  value: string
  label: string
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
  }[]
}
