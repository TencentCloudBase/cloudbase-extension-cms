/**
 *  URL 参数
 */
interface UrlParams {
  projectId: string
}

/**
 * 短信互动渠道
 */
interface ActivityChannel {
  value: string
  label: string
}

/**
 * 全局配置
 */
interface GlobalSetting {
  miniappID?: string
  miniappName?: string
  miniappOriginalID?: string
  enableOperation?: boolean
  activityChannels?: ActivityChannel[]
}
