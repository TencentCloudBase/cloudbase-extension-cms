import { Collection, SystemUserRoles, SYSTEM_ROLE_IDS } from '@/constants'
import { getCloudBaseApp, getUserFromCredential, isDevEnv } from '@/utils'
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'

// 校验用户是否登录，是否存在
@Injectable()
export class GlobalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequest>()

    if (isDevEnv()) {
      return true
    }

    // 获取用户信息
    const app = getCloudBaseApp()
    let userInfo

    // 根据 credential 信息获取用户身份
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
