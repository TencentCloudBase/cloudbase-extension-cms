/* eslint-disable */
const cloud = require('wx-server-sdk')

const { getUrlScheme } = require('./url')
const { getAppBasicInfo } = require('./app')
const { reportMessageTask } = require('./report')

const MessageTasks = 'wx-ext-cms-sms-tasks'
const MessageAuthToken = 'wx-ext-cms-sms-token'

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

/**
 * 下发短信鉴权
 */
async function checkAuth(event = {}, type) {
  const { ENV } = cloud.getWXContext()

  const { token, taskId } = event

  if (!token) {
    throw {
      code: 'NO_AUTH',
      message: '未登录的用户',
    }
  }

  // 查询任务记录
  const {
    data: [tokenRecord],
  } = await cloud
    .database()
    .collection(MessageAuthToken)
    .where({
      token,
    })
    .get()

  // token 不存在
  if (!tokenRecord) {
    throw {
      code: 'INVALID_TOKEN',
      message: '无效的 token',
    }
  }

  // token 失效
  const MAXAGE = 300 * 1000
  if (tokenRecord.createTime + MAXAGE < Date.now() || tokenRecord.used) {
    throw {
      code: 'INVALID_TOKEN',
      message: 'token 已失效',
    }
  }

  // token 和 envId 无法对应
  if (tokenRecord.envId !== ENV) {
    throw {
      code: 'ENV_ERROR',
      message: 'token 异常',
    }
  }

  // taskId missing
  if (!taskId && type !== 'openapi') {
    return {
      code: 'INVALID_PARAM',
      message: '参数错误',
    }
  }

  // token 和任务 id 无法对应
  if (taskId && tokenRecord.taskId !== taskId) {
    throw {
      code: 'TASK_ERROR',
      message: 'token 异常',
    }
  }

  // 将 token 标记为已使用
  await cloud
    .database()
    .collection(MessageAuthToken)
    .doc(tokenRecord._id)
    .update({
      data: {
        used: true,
      },
    })
}
