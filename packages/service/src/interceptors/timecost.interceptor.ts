import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Response } from 'express'
import { Injectable, ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common'

@Injectable()
export class TimeCost implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse() as Response
        // 计算请求耗时，并添加到 header
        const timeCost = Date.now() - res.locals.cost
        res.header('x-request-cost', `${timeCost}`)

        console.info(`请求处理耗时： ${timeCost} ms`)
      })
    )
  }
}
