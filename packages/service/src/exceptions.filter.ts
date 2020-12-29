import { Response } from 'express'
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { logger } from './utils'

interface NestResponse {
  statusCode: number
  message: string
  error: string
}

interface SystemResponse {
  error: {
    code: string
    message: string
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    logger.error(exception)

    try {
      const httpRes = exception?.getResponse?.() as NestResponse & SystemResponse

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR

      let error = {
        code: '',
        message: '',
      }

      if (httpRes?.statusCode) {
        error.code = httpRes.statusCode.toString()
        error.message = `[${httpRes.error}] ${httpRes.message}`
      } else if (httpRes?.error) {
        error = httpRes.error
      } else {
        logger.error(httpRes || {}, '服务异常，响应：')

        error = {
          code: 'SYS_ERR',
          message: exception?.message || '服务异常',
        }
      }

      response.status(status).json({
        error: {
          ...error,
          path: request.url,
        },
        helpText: '异常',
      })
    } catch (e) {
      // 解析错误异常
      logger.error(e || {}, '系统错误')

      response.status(500).json({
        error: {
          code: 'SYS_ERR',
          message: '服务异常',
          path: request.url,
        },
        helpText: '异常',
      })
    }
  }
}
