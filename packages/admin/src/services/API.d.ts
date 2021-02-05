declare namespace API {
  export interface CurrentUser {
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
}
