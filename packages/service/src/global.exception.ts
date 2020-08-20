import { Response } from 'express'
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { CmsException } from './types'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: CmsException | Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // print exception
    console.log('服务异常', exception, exception?.toString())

    try {
      if (exception instanceof HttpException) {
        const message = exception?.message || '服务异常'
        const httpRes = exception.getResponse()
        const status =
          exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR

        const resData = httpRes
          ? httpRes
          : {
              message,
              path: request.url,
              code: 'SYS_ERR',
            }

        response.status(status).json(resData)
      } else {
        response.status(200).json({
          code: 'SYS_ERR',
          path: request.url,
          message: exception?.toString(),
        })
      }
    } catch (e) {
      console.log(e)
      response.status(500).json({
        code: 'SYS_ERR',
        message: '服务异常',
      })
    }
  }
}
