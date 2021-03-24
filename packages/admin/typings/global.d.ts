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

interface MicroApp {
  /**
   * 微应用 id 全局唯一，英文字母
   */
  id: string

  /**
   * 名称
   */
  title: string
}

interface CustomMenuItem {
  /**
   * 随机 id
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
}

/**
 * 全局配置
 */
interface GlobalSetting {
  miniappID?: string
  miniappName?: string
  miniappOriginalID?: string
  enableOperation?: boolean
  activityChannels?: ActivityChannel[]

  /**
   * 微应用列表
   */
  microApps?: MicroApp[]

  /**
   * 微应用菜单信息
   */
  customMenus?: CustomMenuItem[]
}
