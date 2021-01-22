/**
 * 全局上报
 */

interface ActivityChannel {
  value: string
  label: string
}

interface GlobalSetting {
  miniappID?: string
  miniappName?: string
  miniappOriginalID?: string
  enableOperation?: boolean
  activityChannels?: ActivityChannel[]
}
