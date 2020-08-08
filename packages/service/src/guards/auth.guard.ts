import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import {
    Injectable,
    CanActivate,
    HttpStatus,
    HttpException,
    ExecutionContext,
} from '@nestjs/common'
import { getCloudBaseApp } from '@/utils'
import { CollectionV2 } from '@/constants'

// 校验用户是否登录
export class GlobalAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest()

        if (request.path === '/login') {
            return true
        }

        // 登录的用户
        const app = getCloudBaseApp()
        const userInfo = app.auth().getUserInfo()
        const customUserId = userInfo?.customUserId

        if (!customUserId) {
            throw new HttpException(
                {
                    code: 'NO_AUTH',
                    message: '未登录用户',
                },
                HttpStatus.FORBIDDEN
            )
        }

        const { data } = await app.database().collection(CollectionV2.Users).doc(customUserId).get()
        const userRecord = data?.[0]
        // 用户信息不存在
        if (userRecord) {
            throw new HttpException(
                {
                    code: 'AUTH_EXPIRED',
                    message: '登录态失效，请重新登录',
                },
                HttpStatus.FORBIDDEN
            )
        }

        return true
    }
}

@Injectable()
export class ModuleGuard implements CanActivate {
    constructor(private readonly reflector?: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const roles = this.reflector.get<string[]>('roles', context.getHandler())

        return true
    }
}
