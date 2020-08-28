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
        isAdmin: true,
        uuid: 'xxx',
      }

      // request.cmsUser = {
      //     _id: 'test',
      //     roles: ['content:administrator'],
      //     username: 'admin',
      //     createTime: 2020,
      //     uuid: 'xxx'
      // }

      return true
    }

    // 获取用户信息
    // 目前只在云函数中能自动获取用户身份信息
    const app = getCloudBaseApp()
    const { TCB_UUID } = cloudbase.getCloudbaseContext()
    const { userInfo } = await app.auth().getEndUserInfo(TCB_UUID)

    // 未登录用户
    if (!userInfo?.username) {
      request.cmsUser = {
        _id: 'test',
        roles: ['public'],
        username: '_anonymous',
        createTime: 2020,
        isAdmin: false,
        uuid: '',
      }

      return true
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
          error: {
            code: 'AUTH_EXPIRED',
            message: '用户不存在，请确认登录信息！',
          },
        },
        HttpStatus.FORBIDDEN
      )
    }

    request.cmsUser = userRecord

    return true
  }
}
