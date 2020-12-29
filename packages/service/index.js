/* eslint-disable */
const serverless = require('serverless-http')
const entry = require('./app.js')

module.exports.main = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  let app = entry

  // 本次请求的 requestId
  // 云函数当前的一个并发实例在同一时刻仅处理一个事件 
  process.env.CMS_REQUEST_ID = context.request_id

  // support for async load app
  if (entry && entry.tcbGetApp && typeof entry.tcbGetApp === 'function') {
    app = await entry.tcbGetApp()
  }

  const res = await serverless(app, {
    // 无需判断返回值的类型
    binary: false,
  })(event, context)

  // 使用 SDK 调用时，格式化返回的 Body，方便在浏览器中查看返回值
  if (process.env.TCB_SOURCE === 'web_client') {
    try {
      res.body = JSON.parse(res.body)
    } catch (error) {
      // ignore error
    }
  }

  return res
}
