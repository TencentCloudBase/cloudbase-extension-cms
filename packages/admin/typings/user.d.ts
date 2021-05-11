/**
 * 当前登录用户
 */
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

/**
 * 项目
 */
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

  /**
   * 分组
   */
  group?: string[]
}

/**
 * 用户管理
 */
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

/**
 * 用户角色
 */
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
