import { Module, Global } from '@nestjs/common'
import { CloudBaseService, LocalCacheService } from './services'

@Global()
@Module({
  providers: [CloudBaseService, LocalCacheService],
  exports: [CloudBaseService, LocalCacheService],
})
export class GlobalModule {}
