import { Module } from '@nestjs/common'
import { SettingController } from './setting.controller'

@Module({
  controllers: [SettingController],
})
export class SettingModule {}
