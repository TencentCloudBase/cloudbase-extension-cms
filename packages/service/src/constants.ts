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

// 系统角色，无法修改
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
    roleName: '内容管理员',
    description: '允许管理系统内，所有项目的所有内容文档',
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

// 公开角色，即未登录的用户可访问的资源
export const PublicRole = {
  _id: 'public',
  roleName: '公开用户',
  description: '未登录的用户允许访问的资源',
  // 默认为空
  permissions: [],
  // 不允许删除
  delete: false,
}
