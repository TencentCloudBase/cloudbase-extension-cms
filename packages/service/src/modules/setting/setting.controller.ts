import { Controller, Get, Patch } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { Collection } from '@/constants'

@Controller('setting')
export class SettingController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get()
  async getSystemSetting() {
    let {
      data: [setting],
      requestId,
    } = await this.cloudbaseService.collection(Collection.Settings).where({}).get()

    // 添加配置
    if (!setting) {
      await this.cloudbaseService.collection(Collection.Settings).add({})
    }

    return {
      requestId,
      data: setting || {},
    }
  }

  @Patch()
  async updateSystemSetting() {
    let {
      data: [setting],
      requestId,
    } = await this.cloudbaseService.collection(Collection.Settings).where({}).get()

    return {
      requestId,
      data: setting,
    }
  }
}
