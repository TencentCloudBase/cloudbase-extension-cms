// 云函数、数据库等资源命名前缀
export const RESOURCE_PREFIX = process.env.CMS_RESOURCE_PREFIX || 'tcb-ext-cms'

/**
 * 数据库
 */
export const Collection = {
  // 项目集合
  Projects: `${RESOURCE_PREFIX}-projects`,

  // 内容模型集合
  Schemas: `${RESOURCE_PREFIX}-schemas`,

  // Webhooks 集合
  Webhooks: `${RESOURCE_PREFIX}-webhooks`,

  // Webhooks 执行记录集合
  WebhookLog: `${RESOURCE_PREFIX}-webhook-log`,

  // 系统设置
  Settings: `${RESOURCE_PREFIX}-settings`,

  // 用户集合
  Users: `${RESOURCE_PREFIX}-users`,

  // 定义的角色集合
  CustomUserRoles: `${RESOURCE_PREFIX}-user-roles`,

  // 数据导入导出的记录
  DataMigrateTasks: `${RESOURCE_PREFIX}-data-migrate`,

  // 短信活动
  MessageActivity: `${RESOURCE_PREFIX}-sms-activities`,

  // 发送短信记录
  MessageTasks: `${RESOURCE_PREFIX}-sms-tasks`,
}

/**
 * 函数
 */
export const Functions = {
  API: `${RESOURCE_PREFIX}-api`,
}

export enum SYSTEM_ROLE_IDS {
  // 管理员
  ADMIN = 'administrator',
  // 运营
  OPERATOR = 'operator',
  // 内容管理员
  CONTENT_ADMIN = 'content:administrator',
  // 项目管理员
  PROJECT_ADMIN = 'project:administrator',
}

/**
 * 系统角色，无法修改
 * 请勿随意增加系统角色
 */
export const SystemUserRoles: UserRole[] = [
  {
    _id: SYSTEM_ROLE_IDS.ADMIN,
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
    _id: SYSTEM_ROLE_IDS.PROJECT_ADMIN,
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
    _id: SYSTEM_ROLE_IDS.OPERATOR,
    roleName: '运营人员',
    description: '允许管理系统内，所有项目的所有内容文档，并使用运营工具',
    permissions: [
      {
        action: ['*'],
        projectId: '*',
        effect: 'allow',
        service: 'content',
        resource: ['*'],
      },
      {
        action: ['*'],
        projectId: '*',
        effect: 'allow',
        service: 'operation',
        resource: ['*'],
      },
    ],
    type: 'system',
  },
  {
    _id: SYSTEM_ROLE_IDS.CONTENT_ADMIN,
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
