/* eslint-disable */
const cloud = require('wx-server-sdk')
const { reportUserView } = require('./report')

const CMS_RESOURCE_PREFIX = process.env.CMS_RESOURCE_PREFIX || 'tcb-ext-cms'

const MessageActivities = `${CMS_RESOURCE_PREFIX}-sms-activities`

/**
 * 生成 URL schema
 * https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html
 */
async function getUrlScheme(event) {
  const { ENV } = cloud.getWXContext()
  const { activityId, channelId = '_cms_sms_' } = event

  let query = `_activityId_=${activityId}&_source_=${channelId}&_envId_=${ENV}`
  let path = ''
  let activity = ''

  // 上报数据
  try {
    await reportUserView(event)
    console.log('上报数据成功', event)
  } catch (error) {
    console.log('上报数据异常', error)
  }

  // 查询活动
  if (activityId) {
    try {
      const { data } = await cloud.database().collection(MessageActivities).doc(activityId).get()
      activity = data

      if (activity) {
        path = activity.appPath || path
        query = activity.appPathQuery ? `${query}&${activity.appPathQuery}` : query
      }
    } catch (e) {
      // 查询不到数据，即活动不存在
      if (e.message.includes('not exist')) {
        return {
          error: {
            message: '活动不存在！',
            code: e.errCode,
            err: e.message,
          },
        }
      }
    }
  }

  try {
    const res = await cloud.openapi.urlscheme.generate({
      jumpWxa: {
        path,
        query,
      },
      // 如果想不过期则置为 false，并可以存到数据库
      isExpire: true,
      // 五分钟有效期
      expireTime: parseInt(Date.now() / 1000 + 300),
    })

    return {
      activity: activity || {},
      ...res,
    }
  } catch (e) {
    // 捕获错误，提示错误信息
    let message
    switch (e.errCode) {
      case 40002:
        message = '当前小程序暂无生成跳转链接的权限'
        break
      case 40013:
        message = '当前小程序生成跳转链接的权限被封禁'
        break
      case 40097:
        message = '参数 expire_time 填写错误'
        break
      case 40165:
        message = '配置跳转路径错误，请填写合法的小程序访问路径'
        break
      case 40212:
        message = '跳转参数 query 配置错误'
        break
      default:
        message = e.message
    }

    return {
      error: {
        message,
        code: e.errCode,
        err: e.message,
      },
    }
  }
}

module.exports = {
  getUrlScheme,
}
