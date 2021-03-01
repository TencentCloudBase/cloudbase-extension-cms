import { Response } from 'express'
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'

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

const BaseHelpText = '异常，查看帮助文档：https://docs.cloudbase.net/cms/intro.html'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // print exception
    console.error('服务异常', exception, exception?.toString())

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
        console.error('服务异常，响应：', httpRes)
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
        helpText: BaseHelpText,
      })
    } catch (e) {
      // 解析错误异常
      console.error('系统错误', e)

      response.status(500).json({
        error: {
          code: 'SYS_ERR',
          message: '服务异常',
          path: request.url,
        },
        helpText: BaseHelpText,
      })
    }
  }
}
