/* eslint-disable */
const serverless = require('serverless-http')
const entry = require('./app.js')

module.exports.main = async (event, context) => {
  const { action, data, version } = event
  let app = entry

  if (!version) {
    return {
      error: {
        code: 'INVALID_PARAMS',
        message: 'The version param is required',
      },
    }
  }

  // support for async load app
  if (entry && entry.tcbGetApp && typeof entry.tcbGetApp === 'function') {
    app = await entry.tcbGetApp()
  }

  // mock http call
  let res = await serverless(app, {
    // 无需判断返回值的类型
    binary: false,
  })(
    {
      body: data,
      headers: {},
      httpMethod: 'POST',
      queryStringParameters: '',
      path: `/api/${action}`,
    },
    context
  )

  try {
    res = JSON.parse(res.body)
  } catch (error) {
    // ignore error
    console.log(error)
  }

  return res
}
