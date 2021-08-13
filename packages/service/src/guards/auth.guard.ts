import config from '@/config'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'
import { getCloudBaseApp, getUserFromCredential, isDevEnv, isRunInServerMode } from '@/utils'
import cloudbase from '@cloudbase/node-sdk'
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'

/**
 * 1. 校验用户是否登录
 * 2. 校验登录的用户是否为 CMS 用户
 */
@Injectable()
export class GlobalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequest>()

    if (isDevEnv()) {
      request.cmsUser = {
        _id: 'test',
        roles: [SYSTEM_ROLE_IDS.ADMIN],
        username: 'admin',
        createTime: 2020,
        isAdmin: true,
        uuid: 'xxx',
      }

      // request.cmsUser = {
      //     _id: 'test',
      //     roles: [SYSTEM_ROLE_IDS.OPERATOR],
      //     username: 'operator',
      //     createTime: 2020,
      //     uuid: 'xxx'
      // }

      // request.cmsUser = {
      //   _id: 'test',
      //   roles: [SYSTEM_ROLE_IDS.CONTENT_ADMIN],
      //   username: '_anonymous',
      //   createTime: 2020,
      //   uuid: 'xxx',
      // }

      // request.cmsUser = {
      //   _id: '2d44d6c261137bec046f3f4f4356cbdc',
      //   roles: ['2d44d6c261137bd7046f3d934cfbac64'],
      //   username: 'blogUser',
      //   createTime: 1628584045891,
      //   uuid: 'a40d84f659d440edb3417b55c38f9767',
      // }

      return true
    }

    // 获取用户信息
    // 在云函数中获取用户身份信息
    const app = getCloudBaseApp()
    const { TCB_UUID } = cloudbase.getCloudbaseContext()
    let { userInfo } = await app.auth().getEndUserInfo(TCB_UUID)

    // 根据 credential 信息获取用户身份
    const uploadPaths = [`${config.globalPrefix}/upload`, `${config.globalPrefix}/upload/hosting`]
    if (uploadPaths.includes(request.path) || isRunInServerMode()) {
      const { headers } = request
      const credentials = headers['x-cloudbase-credentials'] as string
      if (credentials) {
        // headers.origin 可能为空
        const origin = headers.origin || headers.host || 'http://127.0.0.1:8000'
        const user = await getUserFromCredential(credentials, origin)
        if (user) {
          userInfo = user
        }
      }
    }

    // 未登录用户
    if (!userInfo?.username && !userInfo?.openId) {
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
      .collection(Collection.Users)
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
