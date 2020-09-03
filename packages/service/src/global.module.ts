import { Module, Global } from '@nestjs/common'
import { CloudBaseService } from './services'

@Global()
@Module({
  providers: [CloudBaseService],
})
export class GlobalModule {}
