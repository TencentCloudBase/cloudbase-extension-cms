import { Module } from '@nestjs/common'
import { ProjectsController } from './projects.controller'
import { SchemasService } from './schemas/schema.service'
import { WebhooksService } from './webhooks/webhooks.service'
import { SchemasController } from './schemas/schema.controller'
import { WebhooksController } from './webhooks/webhooks.controller'
import { ContentsService } from './contents/contents.service'
import { ContentsController } from './contents/contents.controller'

@Module({
  controllers: [SchemasController, WebhooksController, ContentsController, ProjectsController],
  providers: [SchemasService, ContentsService, WebhooksService],
})
export class ProjectsModule {}
