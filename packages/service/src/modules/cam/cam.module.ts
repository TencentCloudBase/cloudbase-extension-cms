import { Module } from '@nestjs/common'
import { CamController } from './cam.controller'
import { CamService } from './cam.service'

@Module({
    controllers: [CamController],
    providers: [CamService],
})
export class CamModule {}
