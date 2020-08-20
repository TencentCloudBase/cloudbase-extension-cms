import { Module } from '@nestjs/common'
import { ContentController } from './content.controller'
import { ContentService } from './content.service'
import { WebhookService } from '../webhook/webhook.service'

@Module({
  controllers: [ContentController],
  providers: [ContentService, WebhookService],
})
export class ContentModule {}
