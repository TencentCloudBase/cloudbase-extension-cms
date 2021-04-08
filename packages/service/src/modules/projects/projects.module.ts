import { HttpModule, Module } from '@nestjs/common'
import { ProjectsController } from './projects.controller'
import { SchemasService } from './schemas/schema.service'
import { WebhooksService } from './webhooks/webhooks.service'
import { SchemasController } from './schemas/schema.controller'
import { WebhooksController } from './webhooks/webhooks.controller'
import { ContentsService } from './contents/contents.service'
import { ContentsController } from './contents/contents.controller'
import { MigrateController } from './migrate/migrate.controller'
import { ProjectsService } from './projects.service'
import { OperationController } from './operation/operation.controller'
import { OperationService } from './operation/operation.service'

@Module({
  imports: [HttpModule],
  controllers: [
    SchemasController,
    WebhooksController,
    ContentsController,
    ProjectsController,
    MigrateController,
    OperationController,
  ],
  providers: [SchemasService, ContentsService, OperationService, WebhooksService, ProjectsService],
})
export class ProjectsModule {}
