interface User {
  _id: string

  username: string

  // 创建时间
  createTime: number

  // 用户角色
  roles: UserRole[]

  // cloudbase uuid
  uuid: string

  // 是否为 root 用户
  root?: boolean
}

interface UserRole {
  _id: string

  // 角色名
  roleName: string

  // 角色描述
  description: string

  // 角色绑定的权限描述
  permissions: Permission[]

  type: string | 'system'
}

interface CurrentUser {
  _id: string

  username: string

  password: string

  // 创建时间
  createTime: number

  // 用户角色
  roles: string[]

  avatar?: string

  // 是否项目管理员
  isAdmin: boolean

  // 项目管理员
  isProjectAdmin: boolean

  // 所有可访问的服务
  accessibleService?: '*' | string[]
}

interface Project {
  _id: string

  name: string

  customId: string

  description: string

  // 项目封面图
  cover?: string

  // 是否开启 Api 访问
  enableApiAccess: boolean

  // api 访问路径
  apiAccessPath: string

  // 可读集合
  readableCollections: string[]

  // 可修改的集合
  modifiableCollections: string[]

  // 可删除的集合
  deletableCollections: string[]
}

interface Project {
  _id: string

  name: string

  customId: string

  description: string

  // 项目封面图
  cover?: string

  // 是否开启 Api 访问
  enableApiAccess: boolean

  // Api 访问路径
  apiAccessPath: string
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
