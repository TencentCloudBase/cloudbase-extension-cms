import { Module } from '@nestjs/common'
import { CamController } from './cam.controller'
import { CamService } from './cam.service'
import { ContentService } from '../content/content.service'

@Module({
    controllers: [CamController],
    providers: [CamService, ContentService],
})
export class CamModule {}
