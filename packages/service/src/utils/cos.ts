import COS from 'cos-nodejs-sdk-v5'
import SecretManager, { isRunInContainer } from './cloudbase'
import { getUnixTimestamp } from './date'
import { getCredential, Credential } from './env'

let cos
let secretExpire: number
let secretManager: SecretManager

/**
 * 获取 COS SDK 实例
 */
export const getCosApp = async (parallel = 20) => {
  let credential: Credential

  const now = getUnixTimestamp() + 120
  // 秘钥没有过期，可以继续使用，否则，需要重新获取秘钥
  if (cos && now < secretExpire) {
    return cos
  }

  console.log('运行在云托管中', isRunInContainer())

  // 云托管中
  if (isRunInContainer()) {
    secretManager = new SecretManager()
    const { expire, ...tmpCredential } = await secretManager.getTmpSecret()
    secretExpire = expire
    credential = tmpCredential
  } else {
    credential = getCredential()
  }

  const { secretId, secretKey, token } = credential

  console.log('密钥', credential)

  cos = new COS({
    FileParallelLimit: parallel,
    SecretId: secretId,
    SecretKey: secretKey,
    XCosSecurityToken: token,
  })

  return cos
}
