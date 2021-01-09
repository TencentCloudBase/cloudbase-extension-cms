/* eslint-disable */
const cloud = require('wx-server-sdk')

const MessageTasks = 'wx-ext-cms-sms-task'
const MessageAuthToken = 'wx-ext-cms-sms-token'

exports.main = async (event = {}, context) => {
  const { ENV } = cloud.getWXContext()
  const { taskId } = event

  cloud.init({
    env: ENV,
  })

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
      path: `/cms-action/index.html?actionId=1`,
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
 * 鉴权
 */
async function checkAuth(event = {}) {
  const { ENV } = cloud.getWXContext()
  console.log(ENV)

  const { token, taskId } = event

  if (!token) {
    throw {
      code: 'NO_AUTH',
      message: '未登录的用户',
    }
  }

  // 查询任务记录
  const {
    data: [record],
  } = await cloud
    .database()
    .collection(MessageAuthToken)
    .where({
      token,
    })
    .get()

  // token 不存在
  if (!record) {
    throw {
      code: 'TOKEN_NOT_FOUND',
      message: '无效的 token',
    }
  }

  const MAXAGE = 300 * 1000
  // token 失效
  if (record.createTime + MAXAGE < Date.now()) {
    throw {
      code: 'TOKEN_EXPIRED',
      message: '无效的 token',
    }
  }

  if (record.envId !== ENV) {
    throw {
      code: 'ENV_ERROR',
      message: 'token 与当期环境不一致',
    }
  }

  if (record.taskId !== taskId) {
    throw {
      code: 'TASK_ERROR',
      message: '无效的 token',
    }
  }
}
