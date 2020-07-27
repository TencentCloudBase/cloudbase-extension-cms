import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { timeout } from 'rxjs/operators'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  timeout: number

  constructor(timeout = 10000) {
    this.timeout = timeout
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 超时处理
    return next.handle().pipe(timeout(this.timeout))
  }
}
