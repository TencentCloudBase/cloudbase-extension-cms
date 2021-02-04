import { Observable } from 'rxjs'
import { timeout } from 'rxjs/operators'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  timeout: number

  constructor(timeout = 600000) {
    this.timeout = timeout
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 超时处理
    return next.handle().pipe(timeout(this.timeout))
  }
}
