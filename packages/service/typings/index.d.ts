declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV: 'development' | 'production'
        TCB_ENVID: string
        SECRETID: string
        SECRETKEY: string
    }
}

interface User {
    username: string

    password: string

    // 兼容老版本，将 userName 转换成 username
    userName?: string

    // 创建时间
    createTime: number

    // 登陆失败次数
    failedLogins?: Record<string, number>[]

    // 用户角色
    roles: string[]
}

interface UserRole {
    // 角色名
    roleName: string

    // 角色描述
    description: string

    // 角色绑定的权限描述
    permissions: Permission[]
}

/**
 * 限制
 * 项目 Id 为 * 时，资源必然为 *
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
    service: string | '*'

    // 具体资源
    resource: string[] | ['*']
}

interface RequestUser extends User {
    // 用户可以访问的资源
    projectResource?: {
        [key: string]: '*' | string[]
    }

    isAdmin: boolean
}

interface AuthRequest extends Request {
    cmsUser: RequestUser
}
