/**
 * 参考
 * https://cloud.tencent.com/document/product/213/30435
 */
export enum ErrorCode {
    // 服务错误
    ServerError = 'ServerError',
    // 参数错误
    UnknownParameter = 'UnknownParameter',
    MissingParameter = 'MissingParameter',
    InvalidParameter = 'InvalidParameter',
    InvalidParameterValue = 'InvalidParameterValue',
    // 请求超限
    RequestLimitExceeded = 'RequestLimitExceeded',
    // 资源
    ResourceNotFound = 'ResourceNotFound',
    UnsupportedOperation = 'UnsupportedOperation',
    UnauthorizedOperation = 'UnauthorizedOperation',
}

// V1 集合名
export const CollectionV1 = {
    Schemas: 'tcb-ext-cms-contents',
    Users: 'tcb-ext-cms-users',
    Webhooks: 'tcb-ext-cms-webhooks',
}

// V2 集合名
export const CollectionV2 = {
    // 项目集合
    Projects: 'tcb-ext-cms-projects',

    // 内容原型集合
    Schemas: 'tcb-ext-cms-schemas',

    // Webhooks 集合
    Webhooks: 'tcb-ext-cms-webhooks',

    // 系统设置
    Settings: 'tcb-ext-cms-settings',

    // 用户集合
    Users: 'tcb-ext-cms-users',

    // CAM 策略
    CamPolices: 'tcb-ext-cms-cam-polices',

    // 用户群组
    UserGroup: 'tcb-ext-cms-user-group',
}

// 系统策略
export const CmsPolices: Policy[] = [
    {
        policyName: 'AdministratorAccess',
        description: '该策略允许您管理系统内所有用户及其权限、所有内容、所有系统设置等',
        definition: {
            version: '1.0',
            statement: [
                {
                    action: ['*'],
                    effect: 'allow',
                    resource: ['*'],
                },
            ],
        },
    },
    {
        policyName: 'ProjectFullAccess',
        description: '该策略允许您管理系统内的所有项目及项目内的资源',
        definition: {
            version: '1.0',
            statement: [
                {
                    action: ['project:*'],
                    effect: 'allow',
                    resource: ['*'],
                },
            ],
        },
    },
    {
        policyName: 'ContentFullAccess',
        description: '该策略允许您管理系统内的所有内容',
        definition: {
            version: '1.0',
            statement: [
                {
                    action: ['project:content:*', 'project:schema:*'],
                    effect: 'allow',
                    resource: ['*'],
                },
            ],
        },
    },
]

export const DefaultUserGroups = [
    {
        _id: 'administrator',
        groupName: '系统管理员',
        attachedPolices: ['AdministratorAccess'],
    },
    {
        _id: 'content:administrator',
        groupName: '系统内容管理员',
        attachedPolices: ['ContentFullAccess'],
    },
    {
        _id: 'project:administrator',
        groupName: '项目管理员',
        attachedPolices: ['ProjectFullAccess'],
    },
]
