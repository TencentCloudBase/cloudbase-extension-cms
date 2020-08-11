interface PolicyDoc {
    // 1.0、2.0、3.0 等
    version: string

    statement: {
        // 行为
        // 服务 + action
        // * 所有资源，所有操作
        // content:* 内容所有操作
        // content:get* 内容查询操作
        action: string[] | ['*']

        // TODO: 允许访问/拒绝访问
        effect: 'allow' | 'deny'

        // 定义具体服务资源，仅在部分情况下需要
        resource: string[] | ['*']
    }
}

const CurrentService = [
    'project',
    'project:content',
    'project:schema',
    'project:webhook',
    'project:setting',
]

//
export const userAccessChecker = async (
    user: User,
    action: string,
    service: string,
    resource: string
) => {
    const { group, attachedPolices } = user

    if (!group?.length || !attachedPolices?.length) {
        return false
    }

    //
    const statements = attachedPolices.map((_) => _.definition.statement)

    // 检查 action 行为
    // const actionValid = statements.some((statement) => {})
}
