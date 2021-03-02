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
