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

    // 用户组
    group: string[]

    // 关联策略
    attachedPolices: Policy[]
}

// TODO: 支持自定义
interface Policy {
    // 策略名
    policyName: string

    // 策略说明
    description: string

    // policy 定义
    definition: PolicyDoc
}

interface PolicyStatement {
    // 行为
    action: string[] | ['*']

    // TODO: 允许访问/拒绝访问
    effect: 'allow' | 'deny'

    // 具体资源
    resource: string[] | ['*']
}

interface PolicyDoc {
    // 1.0、2.0、3.0 等
    version: string

    statement: PolicyStatement[]
}
