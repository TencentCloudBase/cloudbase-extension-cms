/* eslint-disable */
const cloud = require('wx-server-sdk')

const MessageActivities = 'wx-ext-cms-sms-activities'
const MessageTasks = 'wx-ext-cms-sms-tasks'
const MessageAuthToken = 'wx-ext-cms-sms-token'

/**
 * 下发短信 https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/cloudbase/cloudbase.sendSms.html
 */
exports.main = async (event = {}) => {
  const { taskId, action } = event
  const { ENV } = cloud.getWXContext()

  cloud.init({
    env: ENV,
  })

  if (action === 'getUrlScheme') {
    return getUrlScheme(event)
  }

  /**
   * 校验 token 和任务信息
   */
  try {
    await checkAuth(event)
  } catch (e) {
    console.log(e)
    return e
  }

  console.log('校验通过')

  const db = cloud.database()

  try {
    // 查询任务记录
    const { data: task } = await db.collection(MessageTasks).doc(taskId).get()

    if (!task) {
      return {
        code: 'TASK_NOT_FOUND',
        message: 'task 未找到',
      }
    }

    console.log(task)

    // 获取号码列表，补充 +86 前缀
    const phoneNumberList = task.phoneNumberList.map((num) =>
      num.match(/^\+86/) ? num : `+86${num}`
    )

    console.log(phoneNumberList)

    // 下发短信
    const result = await cloud.openapi.cloudbase.sendSms({
      env: ENV,
      phoneNumberList,
      content: task.content,
      path: `/cms-activities/index.html?activityId=${task.activityId}`,
    })

    // 发送结果列表
    const { sendStatusList } = result

    // 更新任务记录
    await db
      .collection(MessageTasks)
      .doc(taskId)
      .update({
        data: {
          status: 'send_success',
          sendStatusList,
        },
      })

    console.log(result)
    return result
  } catch (err) {
    console.log('下发失败', err)
    // 更新任务记录
    await db
      .collection(MessageTasks)
      .doc(taskId)
      .update({
        data: {
          status: 'send_fail',
          error: err.message,
        },
      })

    return err
  }
}

/**
 * 下发短信鉴权
 */
async function checkAuth(event = {}) {
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

  // token 和任务 id 无法对应
  if (tokenRecord.taskId !== taskId) {
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

/**
 * 生成 URL schema
 * https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html
 */
async function getUrlScheme(event) {
  const { activityId } = event

  let query = ''
  let path = ''
  let activity = ''

  // 查询活动
  if (activityId) {
    const { data } = await cloud.database().collection(MessageActivities).doc(activityId).get()

    activity = data

    if (activity) {
      path = activity.appPath || path
      query = activity.appPathQuery || query
    }
  }

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
}
