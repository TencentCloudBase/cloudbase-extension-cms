import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(@Inject(REQUEST) private request: IRequest) {}

  async getCurrentUser() {
    const { cmsUser } = this.request
    return cmsUser
  }
}
