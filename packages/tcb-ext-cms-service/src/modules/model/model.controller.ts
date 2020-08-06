import { Controller, Post, Inject, Body } from '@nestjs/common'
import { ModelService } from './model.service'
import { getEnvIdString, getCloudBaseApp } from '@/utils'

@Controller('model')
export class ModelController {
  constructor(private service: ModelService) {}

  @Post()
  async entry(@Body() body) {
    const { resource, operate, params } = body

    const app = getCloudBaseApp()
    const db = app.database()

    console.log(resource, operate, params)

    // 获取用户身份信息
    const userInfo = app.auth().getUserInfo()
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
