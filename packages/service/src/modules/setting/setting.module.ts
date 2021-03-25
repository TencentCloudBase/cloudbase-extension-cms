import { CloudBaseService } from '@/services'

import { Module } from '@nestjs/common'
import { SettingController } from './setting.controller'
import { SettingService } from './setting.service'

@Module({
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {
  constructor(private readonly cloudbaseService: CloudBaseService) {}
}
