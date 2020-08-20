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

  // 内容模型集合
  Schemas: 'tcb-ext-cms-schemas',

  // Webhooks 集合
  Webhooks: 'tcb-ext-cms-webhooks',

  // 系统设置
  Settings: 'tcb-ext-cms-settings',

  // 用户集合
  Users: 'tcb-ext-cms-users',

  // 定义的角色集合
  CustomUserRoles: 'tcb-ext-cms-user-roles',
}

// 系统默认角色
export const SystemUserRoles: UserRole[] = [
  {
    _id: 'administrator',
    roleName: '系统管理员',
    description: '允许管理系统内所有用户及其权限、所有内容、所有系统设置等',
    permissions: [
      {
        projectId: '*',
        action: ['*'],
        effect: 'allow',
        resource: ['*'],
        service: '*',
      },
    ],
    type: 'system',
  },
  {
    _id: 'project:administrator',
    roleName: '项目管理员',
    description: '允许管理系统内的所有项目及项目内的资源',
    permissions: [
      {
        action: ['*'],
        projectId: '*',
        effect: 'allow',
        service: '*',
        resource: ['*'],
      },
    ],
    type: 'system',
  },
  {
    _id: 'content:administrator',
    roleName: '系统内容管理员',
    description: '允许管理系统内的所有内容',
    permissions: [
      {
        action: ['*'],
        projectId: '*',
        effect: 'allow',
        service: 'content',
        resource: ['*'],
      },
    ],
    type: 'system',
  },
]
