import { HttpException } from '@nestjs/common'

/**
 * 参考
 * https://cloud.tencent.com/document/product/213/30435
 */
export enum ErrorCode {
  // 服务错误
  ServerError = 'ServerError',
  // 参数错误
  UnknownParameter = 'UnknownParameter',
  // 参数错误
  InvalidParameter = 'InvalidParameter',
  // 参数值错误
  InvalidParameterValue = 'InvalidParameterValue',
  // 请求超限
  RequestLimitExceeded = 'RequestLimitExceeded',

  // 不支持的操作
  UnsupportedOperation = 'UnsupportedOperation',
  // 权限不足
  UnauthorizedOperation = 'UnauthorizedOperation',

  // 资源
  ResourceNotFound = 'ResourceNotFound',

  // 资源被占用
  ResourceInUse = 'ResourceInUse',
}

export class CmsException extends HttpException {
  constructor(code: string, message: string) {
    super(
      {
        error: {
          code,
          message,
        },
      },
      200
    )
  }
}

export class BadRequestException extends HttpException {
  constructor(msg?: string) {
    super(
      {
        error: {
          code: 'BadRequest',
          message: msg || '请求参数异常',
        },
      },
      200
    )
  }
}

export class RecordExistException extends HttpException {
  constructor(msg?: string) {
    super(
      {
        error: {
          code: 'RECORD_EXIST',
          message: msg || '记录已存在',
        },
      },
      200
    )
  }
}

export class RecordNotExistException extends HttpException {
  constructor(msg?: string) {
    super(
      {
        error: {
          code: ErrorCode.ResourceNotFound,
          message: msg || '记录不存在',
        },
      },
      200
    )
  }
}

// 没有权限访问的错误
export class UnauthorizedOperation extends HttpException {
  constructor(msg?: string) {
    super(
      {
        error: {
          code: ErrorCode.UnauthorizedOperation,
          message: msg || '未授权的操作',
        },
      },
      403
    )
  }
}

export class UnsupportedOperation extends HttpException {
  constructor(msg?: string) {
    super(
      {
        error: {
          code: ErrorCode.UnsupportedOperation,
          message: msg || '不支持的操作',
        },
      },
      200
    )
  }
}
