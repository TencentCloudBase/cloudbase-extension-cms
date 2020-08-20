import { Module } from '@nestjs/common'
import { WebhookController } from './webhook.controller'
import { ContentService } from '../content/content.service'
import { WebhookService } from './webhook.service'

@Module({
  controllers: [WebhookController],
  providers: [ContentService, WebhookService],
})
export class WebhookModule {}
