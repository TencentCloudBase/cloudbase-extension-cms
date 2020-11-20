// 云函数、数据库等资源命名前缀
export const RESOURCE_PREFIX = process.env.CMS_RESOURCE_PREFIX || 'tcb-ext-cms'

/**
 * 数据库
 */
export const CollectionV2 = {
  // 项目集合
  Projects: `${RESOURCE_PREFIX}-projects`,

  // 内容模型集合
  Schemas: `${RESOURCE_PREFIX}-schemas`,

  // Webhooks 集合
  Webhooks: `${RESOURCE_PREFIX}-webhooks`,

  // 系统设置
  Settings: `${RESOURCE_PREFIX}-settings`,

  // 用户集合
  Users: `${RESOURCE_PREFIX}-users`,

  // 定义的角色集合
  CustomUserRoles: `${RESOURCE_PREFIX}-user-roles`,

  // 数据导入导出的记录
  DataMigrateTasks: `${RESOURCE_PREFIX}-data-migrate`,
}

/**
 * 函数
 */
export const Functions = {
  API: `${RESOURCE_PREFIX}-api`,
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
