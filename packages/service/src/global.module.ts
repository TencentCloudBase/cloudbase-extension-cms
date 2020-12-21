import { Module, Global } from '@nestjs/common'
import { CloudBaseService, LocalCacheService, SchemaCacheService } from './services'

@Global()
@Module({
  providers: [CloudBaseService, LocalCacheService, SchemaCacheService],
  exports: [CloudBaseService, LocalCacheService, SchemaCacheService],
})
export class GlobalModule {}
