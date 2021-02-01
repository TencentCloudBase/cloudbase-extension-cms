/* eslint-disable */
const cloud = require('wx-server-sdk')

const { getUrlScheme } = require('./url')

/**
 * 下发短信 https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/cloudbase/cloudbase.sendSms.html
 */
exports.main = async (event = {}, context) => {
  const { taskId, action } = event
  const { ENV } = cloud.getWXContext()

  cloud.init({
    env: ENV,
  })

  // 生成 url schema
  if (action === 'getUrlScheme') {
    return getUrlScheme(event)
  }

  return {
    code: 'DEPRECATED',
    message: '服务未找到',
  }
}
