import { Module, Global } from '@nestjs/common'
import { CloudBaseProvider } from './cloudbase'

@Global()
@Module({
  providers: [CloudBaseProvider],
  exports: [CloudBaseProvider]
})
export class GlobalLibModule {}
