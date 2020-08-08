import { Module } from '@nestjs/common'
import { WebhookController } from './webhook.controller'
import { ContentService } from '../content/content.service'

@Module({
    controllers: [WebhookController],
    providers: [ContentService],
})
export class WebhookModule {}
