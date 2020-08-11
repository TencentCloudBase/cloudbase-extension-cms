import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import {
    Injectable,
    CanActivate,
    HttpStatus,
    HttpException,
    ExecutionContext,
} from '@nestjs/common'
// import { DefaultUserGroup } from '@/constants'
import { CloudBaseService } from '@/dynamic_modules'

@Injectable()
export class CamGuard implements CanActivate {
    constructor(
        private readonly cloudbaseService: CloudBaseService,
        private readonly reflector?: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request & { user: User } = context.switchToHttp().getRequest()
        const roles = this.reflector.get<string[]>('roles', context.getHandler())
        console.log('handler', context.getHandler().name)
        console.log(this.cloudbaseService)

        const user = request.user

        // 用户信息不存在
        if (!user) {
            throw new HttpException(
                {
                    code: 'AUTH_EXPIRED',
                    message: '用户不存在，请重新登录',
                },
                HttpStatus.FORBIDDEN
            )
        }

        // if (user.group === CmsGroup.SystemAdmin) {
        //     return true
        // }

        return false
    }
}
