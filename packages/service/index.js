/* eslint-disable */
const serverless = require('serverless-http')
const entry = require('./app.js')

module.exports.main = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  let app = entry

  // support for async load app
  if (entry && entry.tcbGetApp && typeof entry.tcbGetApp === 'function') {
    app = await entry.tcbGetApp()
  }

  return serverless(app)(event, context)
}
