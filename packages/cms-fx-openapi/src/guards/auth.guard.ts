import { CanActivate, Injectable } from '@nestjs/common'
import { getWxCloudApp, isDevEnv } from '@/utils'

// 校验用户是否登录，是否存在
@Injectable()
export class GlobalAuthGuard implements CanActivate {
  async canActivate(): Promise<boolean> {
    if (isDevEnv()) {
      return true
    }

    const wxCloud = getWxCloudApp()
    const { SOURCE } = wxCloud.getWXContext()

    // 仅支持微信 HTTP API 调用
    if (SOURCE === 'wx_http') {
      return true
    }

    return false
  }
}
