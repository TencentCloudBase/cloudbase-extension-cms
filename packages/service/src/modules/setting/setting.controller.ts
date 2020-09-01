import { Controller, Get, Patch } from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2 } from '@/constants'

@Controller('setting')
export class SettingController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get()
  async getSystemSetting() {
    let {
      data: [setting],
      requestId,
    } = await this.cloudbaseService.collection(CollectionV2.Settings).where({}).get()

    return {
      data: setting,
      requestId,
    }
  }

  @Patch()
  async updateSystemSetting() {
    let {
      data: [setting],
      requestId,
    } = await this.cloudbaseService.collection(CollectionV2.Settings).where({}).get()

    return {
      data: setting,
      requestId,
    }
  }
}
