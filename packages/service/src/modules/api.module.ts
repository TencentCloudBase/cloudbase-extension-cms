import { Module } from '@nestjs/common'
import { ApiController } from './api.controller'
import { ApiService } from './api.service'
import { FileModule } from './file/file.module'
import { UtilModule } from './util/util.module'

@Module({
  controllers: [ApiController],
  providers: [ApiService],
  imports: [UtilModule, FileModule],
})
export class ApiModule {}
