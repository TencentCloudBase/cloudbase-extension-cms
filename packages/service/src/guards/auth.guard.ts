import { CollectionV2 } from '@/constants'
import { getCloudBaseApp, isDevEnv } from '@/utils'
import cloudbase from '@cloudbase/node-sdk'
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { Request } from 'express'

// 校验用户是否登录，是否存在
@Injectable()
export class GlobalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest & Request>()

    if (isDevEnv()) {
      request.cmsUser = {
        _id: 'test',
        roles: ['administrator'],
        username: 'admin',
        createTime: 2020,
        password: 'cloudbase',
        isAdmin: true,
        uuid: 'xxx',
      }

      // request.cmsUser = {
      //     _id: 'test',
      //     roles: ['content:administrator'],
      //     username: 'admin',
      //     createTime: 2020,
      //     password: 'cloudbase',
      //     uuid: 'xxx'
      // }

      return true
    }

    // 登录的用户
    // 目前只在云函数中能自动获取用户身份信息
    const app = getCloudBaseApp()
    const { TCB_UUID } = cloudbase.getCloudbaseContext()

    console.log('用户 ID', TCB_UUID)

    const { userInfo } = await app.auth().getEndUserInfo(TCB_UUID)

    console.log('用户信息', userInfo)

    if (!userInfo?.username) {
      throw new HttpException(
        {
          code: 'NO_AUTH',
          message: '未登录用户',
        },
        HttpStatus.FORBIDDEN
      )
    }

    const {
      data: [userRecord],
    } = await app
      .database()
      .collection(CollectionV2.Users)
      .where({
        username: userInfo.username,
      })
      .get()

    // 用户信息不存在
    if (!userRecord) {
      throw new HttpException(
        {
          code: 'AUTH_EXPIRED',
          message: '用户不存在，请确认登录信息！',
        },
        HttpStatus.FORBIDDEN
      )
    }

    request.cmsUser = userRecord

    return true
  }
}
