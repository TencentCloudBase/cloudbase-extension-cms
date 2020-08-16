import { Observable } from 'rxjs'
import { timeout } from 'rxjs/operators'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import config from '@/config'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    timeout: number

    constructor(timeout = config.timeout) {
        this.timeout = timeout
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('请求时间：')
        console.timeEnd('Entry')
        // 超时处理
        return next.handle().pipe(timeout(this.timeout))
    }
}
