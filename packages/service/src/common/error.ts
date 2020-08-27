import { HttpException, ForbiddenException } from '@nestjs/common'

export class CmsException extends HttpException {
  constructor(code: string, message: string) {
    super(
      {
        code,
        message,
      },
      200
    )
  }
}

export class BadRequestException extends HttpException {
  constructor(msg?: string) {
    super(
      {
        code: 'BadRequest',
        message: msg || '请求参数异常',
      },
      200
    )
  }
}

export class RecordExistException extends HttpException {
  constructor(msg?: string) {
    super(
      {
        code: 'RECORD_EXIST',
        message: msg || '记录已存在',
      },
      200
    )
  }
}

export class RecordNotExistException extends HttpException {
  constructor(msg?: string) {
    super(
      {
        code: 'RECORD_EXIST',
        message: msg || '记录不存在',
      },
      200
    )
  }
}

export class UnauthorizedOperation extends HttpException {
  constructor(msg?: string) {
    super(
      {
        code: 'UnauthorizedOperation',
        message: msg || '未授权的操作',
      },
      403
    )
  }
}
