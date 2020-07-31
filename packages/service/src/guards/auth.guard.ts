import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector?: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const roles = this.reflector.get<string[]>('roles', context.getHandler())

        return true
    }
}

export class GlobalAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest()

        if (request.path === '/login') {
            return true
        }

        // if (!customUserId) {
        //   throw new HttpException(
        //     {
        //       code: 'NO_AUTH',
        //       message: '未登录用户'
        //     },
        //     HttpStatus.FORBIDDEN
        //   )
        // }

        return true
    }
}
