import { Injectable } from '@nestjs/common'
import { getCloudBaseManager } from '@/utils'
import { EndUserInfo } from '@cloudbase/manager-node/types/interfaces'

@Injectable()
export class UserService {
  // 用户名密码登录 => 注册用户信息
  async createUser(username: string, password: string): Promise<EndUserInfo> {
    const manager = await getCloudBaseManager()

    console.info('注册用户信息', username)

    const { User } = await manager.user.createEndUser({
      username,
      password,
    })

    console.info(User)

    return User
  }

  async deleteUser(uuid: string) {
    const manager = await getCloudBaseManager()
    return manager.user.deleteEndUsers({
      userList: [uuid],
    })
  }

  async updateUserInfo(uuid: string, data: { username: string; password: string }) {
    const { username, password } = data
    const manager = await getCloudBaseManager()
    return manager.user.modifyEndUser({
      uuid,
      username,
      password,
    })
  }
}
