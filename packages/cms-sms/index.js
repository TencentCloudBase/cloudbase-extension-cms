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

  if (action === 'getAppBasicInfo') {
    /**
     * 校验 token 和任务信息
     */
    try {
      await checkAuth(event, 'openapi')
    } catch (e) {
      console.log(e)
      return e
    }
    return getAppBasicInfo()
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

    // 上报短信下发任务
    try {
      await reportMessageTask({
        taskId,
        phoneCount: phoneNumberList.length,
        activityId: task.activityId,
      })
    } catch (error) {
      console.log('上报错误', error)
    }

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
    console.log('下发短信失败', err)

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

    let message

    switch (err.errCode) {
      case -1:
        message = '系统繁忙，此时请开发者稍候再试'
        break
      case -601027:
        message = '无效的环境'
        break
      case -601028:
        message = '该环境没有开通静态网站'
        break
      case -601029:
        message = '信息长度过长'
        break
      case -601030:
        message = '信息含有违法违规内容'
        break
      case -601031:
        message = '无效的 Path'
        break
      case -601032:
        message = '小程序昵称不能为空'
        break
      case -601033:
        message = '仅支持非个人主体小程序'
        break
      default:
        message = err.message
    }

    return {
      error: {
        message,
        code: err.errCode,
      },
    }
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
