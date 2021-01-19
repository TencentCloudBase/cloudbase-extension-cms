import COS from 'cos-nodejs-sdk-v5'
import { getCredential } from './env'

/**
 * 获取 COS SDK 实例
 */
export const getCosApp = (parallel = 20) => {
  const { secretId, secretKey, token } = getCredential()

  return new COS({
    FileParallelLimit: parallel,
    SecretId: secretId,
    SecretKey: secretKey,
    XCosSecurityToken: token,
  })
}
