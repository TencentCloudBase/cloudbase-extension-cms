import { Module } from '@nestjs/common'
import { ProjectController } from './project.controller'

@Module({
  controllers: [ProjectController],
})
export class ProjectModule {}
