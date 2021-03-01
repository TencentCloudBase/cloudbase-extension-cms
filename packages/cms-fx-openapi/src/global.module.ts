import { Module, Global } from '@nestjs/common'
import { CloudBaseService } from './services'

@Global()
@Module({
  providers: [CloudBaseService],
  exports: [CloudBaseService],
})
export class GlobalModule {}
