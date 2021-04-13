/* eslint-disable */
const crypto = require('crypto')
const cloud = require('wx-server-sdk')

/**
 * 上报短信下发任务
 */
async function reportMessageTask(event = {}) {
  const { taskId, phoneCount, activityId } = event

  const { ENV } = cloud.getWXContext()
  await cloud.openapi({ convertCase: false }).cloudbase.report({
    reportAction: 'sendSmsTask', // 下发短信上报
    activityId, // 活动 ID
    taskId, // 任务 ID
    phoneCount, // 手机数量
    envId: ENV, // 环境 ID
  })
}

const hashNode = (val) => crypto.createHash('sha256').update(val).digest('hex')

const base64 = (v) => Buffer.from(v).toString('base64')

/**
 * 上报 H5 页面访问数据
 */
async function reportUserView(event = {}) {
  const { ENV } = cloud.getWXContext()
  let { activityId, channelId, sessionId, referer } = event
  const clientIP = process.env.WX_CLIENTIP || process.env.WX_CLIENTIPV6 || '127.0.0.1'

  if (!sessionId) {
    sessionId = hashNode(clientIP).slice(0, 36)
  }

  // 记录 IP 地址
  sessionId += `-${base64(clientIP)}`
  console.log('IP 地址', clientIP, sessionId)

  const result = await cloud.openapi({ convertCase: false }).cloudbase.report({
    referer, // 访问 referer
    activityId, // 活动 ID
    channelId, // 渠道 ID
    sessionId, // 用户访问ID
    envId: ENV, // 环境 ID
    reportAction: 'openH5', // 开发 H5 上报
  })

  console.log(result)
}

module.exports = {
  reportUserView,
  reportMessageTask,
}
