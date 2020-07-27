/**
 * 参考
 * https://cloud.tencent.com/document/product/213/30435
 */
export enum ErrorCode {
  // 服务错误
  ServerError = 'ServerError',
  // 参数错误
  UnknownParameter = 'UnknownParameter',
  MissingParameter = 'MissingParameter',
  InvalidParameter = 'InvalidParameter',
  InvalidParameterValue = 'InvalidParameterValue',
  // 请求超限
  RequestLimitExceeded = 'RequestLimitExceeded',
  // 资源
  ResourceNotFound = 'ResourceNotFound',
  UnsupportedOperation = 'UnsupportedOperation',
  UnauthorizedOperation = 'UnauthorizedOperation'
}
