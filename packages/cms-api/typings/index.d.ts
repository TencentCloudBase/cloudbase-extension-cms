declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    TCB_ENVID: string
    SECRETID: string
    SECRETKEY: string
  }
}

interface User {
  _id: string

  username: string

  // 创建时间
  createTime: number

  // 用户角色
  roles: string[]

  // cloudbase uuid
  uuid: string
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

/**
 * 限制
 * 项目 ID 为 * 时，资源必然为 *
 * 服务未 * 时，资源必然为 *
 */
interface Permission {
  // 项目
  projectId: '*' | string

  // 行为
  action: string[] | ['*']

  // TODO: 允许访问/拒绝访问
  effect: 'allow' | 'deny'

  // 服务
  // 一个权限规则仅支持一个 service
  service: string | '*'

  // 具体资源
  resource: string[] | ['*']
}

interface RequestUser extends User {
  // 用户可以访问的资源
  projectResource?: {
    [key: string]: '*' | string[]
  }

  // 所有可访问的服务
  accessibleService?: '*' | string[]

  // 系统管理员
  isAdmin?: boolean

  // 项目管理员
  isProjectAdmin?: boolean

  // 用户关联的角色信息
  userRoles?: UserRole[]
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

interface ApiAccessToken {
  id: string
  name: string
  token: string
  permissions: ('read' | 'modify' | 'delete')[]
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
  apiAuthTokens?: ApiAccessToken[]
}
