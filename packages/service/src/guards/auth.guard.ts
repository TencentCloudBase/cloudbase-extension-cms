import { Request } from 'express'
import {
    Injectable,
    CanActivate,
    HttpStatus,
    HttpException,
    ExecutionContext,
} from '@nestjs/common'
import { CollectionV2 } from '@/constants'
import { getCloudBaseApp, isDevEnv } from '@/utils'

// 校验用户是否登录，是否存在
@Injectable()
export class GlobalAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthRequest & Request>()
        console.time('Entry')

        if (isDevEnv()) {
            // request.cmsUser = {
            //     roles: ['administrator'],
            //     username: 'admin',
            //     createTime: 2020,
            //     password: 'cloudbase',
            //     isAdmin: true,
            // }

            request.cmsUser = {
                roles: ['content:administrator'],
                username: 'admin',
                createTime: 2020,
                password: 'cloudbase',
            }

            return true
        }

        // 跳过登录
        if (request.path === '/api/auth/login') {
            return true
        }

        // 登录的用户
        // 目前只在云函数中能自动获取用户身份信息
        const app = getCloudBaseApp()
        const userInfo = app.auth().getUserInfo()
        const customUserId = userInfo?.customUserId

        console.log('当前登录用户', userInfo)

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
        if (!userRecord) {
            throw new HttpException(
                {
                    code: 'AUTH_EXPIRED',
                    message: '用户不存在，请重新登录',
                },
                HttpStatus.FORBIDDEN
            )
        }

        request.cmsUser = userRecord

        return true
    }
}
