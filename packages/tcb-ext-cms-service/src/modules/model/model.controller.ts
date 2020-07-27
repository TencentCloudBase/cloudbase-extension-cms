import { Controller, Post, Inject, Body } from '@nestjs/common'
import { CloudBase } from '@cloudbase/node-sdk/lib/cloudbase'
import { ModelService } from './model.service'
import { getEnvIdString } from '@/utils'

@Controller('model')
export class ModelController {
  constructor(
    private service: ModelService,
    @Inject('CloudBase') private readonly app: CloudBase
  ) {}

  @Post()
  async entry(@Body() body) {
    const { resource, operate, params } = body

    const db = this.app.database()

    console.log(resource, operate, params)

    // 获取用户身份信息
    const userInfo = this.app.auth().getUserInfo()
    const customUserId = userInfo.customUserId
    const dbUsers = await db
      .collection('tcb-ext-cms-users')
      .where({
        userName: customUserId
      })
      .get()

    const dbUser = dbUsers.data[0]

    const envId = getEnvIdString()

    return this.service.callModel(
      {
        resource,
        operate,
        params
      },
      {
        db,
        envId,
        userInfo,
        dbUser: dbUser || {}
      }
    )
  }
}
