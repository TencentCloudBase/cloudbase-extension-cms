import { Injectable, ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class TimeCost implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>  {
    const start = Date.now()
    // const req = context.switchToHttp().getRequest()
    // const log = `${req.method}:  ${req.url}\nBody: ${JSON.stringify(req.body)}`
    return next.handle().pipe(tap(() => console.log(`Time: ${Date.now() - start} ms\n`)))
  }
}
