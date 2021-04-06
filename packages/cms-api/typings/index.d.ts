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
