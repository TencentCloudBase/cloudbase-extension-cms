/* eslint-disable */
const cloud = require('wx-server-sdk')

/**
 * 获取 app 基本信息
 */
async function getAppBasicInfo() {
  try {
    const res = await cloud.openapi.auth.getBasicInfo()
    console.log('小程序信息', res)
    return res
  } catch (e) {
    return {
      error: {
        message: e.message,
        code: e.errCode,
      },
    }
  }
}

module.exports = {
  getAppBasicInfo,
}
