import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { getCloudBaseApp } from '@/utils'

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

    const { resource, operate, params } = request.body

    // 登录的用户
    const app = getCloudBaseApp()
    const userInfo = app.auth().getUserInfo()
    const customUserId = userInfo?.customUserId

    console.log('用户信息', userInfo)

    if (!customUserId) {
      throw new HttpException(
        {
          code: 'NO_AUTH',
          message: '未登录用户'
        },
        HttpStatus.FORBIDDEN
      )
    }
    // const app = this.app.database().

    // console.log(resource, operate, params)

    // 获取用户身份信息
    // const userInfo = app.auth().getUserInfo()
    // const customUserId = userInfo.customUserId
    // const dbUsers = await db
    //   .collection('tcb-ext-cms-users')
    //   .where({
    //     userName: customUserId
    //   })
    //   .get()

    // const dbUser = dbUsers.data[0]

    return true
  }
}
