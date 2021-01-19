export interface Credential {
  secretId: string
  secretKey: string
  token?: string
  region?: string
}

/**
 * 从环境变量中解析密钥信息
 */
export const getCredential = (): Credential => {
  const {
    SECRETID,
    SECRETKEY,
    TENCENTCLOUD_REGION = 'ap-shanghai',
    TENCENTCLOUD_SECRETID,
    TENCENTCLOUD_SECRETKEY,
    TENCENTCLOUD_SESSIONTOKEN,
  } = process.env

  const secretId = SECRETID || TENCENTCLOUD_SECRETID
  const secretKey = SECRETKEY || TENCENTCLOUD_SECRETKEY

  return {
    secretId,
    secretKey,
    region: TENCENTCLOUD_REGION,
    token: TENCENTCLOUD_SESSIONTOKEN,
  }
}
