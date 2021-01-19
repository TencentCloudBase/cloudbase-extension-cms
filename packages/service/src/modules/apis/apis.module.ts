import { Module } from '@nestjs/common'
import { ApisController } from './apis.controller'
import { ApisService } from './apis.service'
import { FileModule } from '../file/file.module'
import { UtilService } from './util.service'
import { AuthService } from './auth.service'

@Module({
  controllers: [ApisController],
  providers: [ApisService, UtilService, AuthService],
  imports: [FileModule],
})
export class ApisModule {}
