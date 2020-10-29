import { Module } from '@nestjs/common'
import { ProjectsController } from './projects.controller'
import { SchemasService } from './schemas/schema.service'
import { WebhooksService } from './webhooks/webhooks.service'
import { SchemasController } from './schemas/schema.controller'
import { WebhooksController } from './webhooks/webhooks.controller'
import { ContentsService } from './contents/contents.service'
import { ContentsController } from './contents/contents.controller'
import { MigrateController } from './migrate/migrate.controller'
import { ProjectsService } from './projects.service'

@Module({
  controllers: [
    SchemasController,
    WebhooksController,
    ContentsController,
    ProjectsController,
    MigrateController,
  ],
  providers: [SchemasService, ContentsService, WebhooksService, ProjectsService],
})
export class ProjectsModule {}
