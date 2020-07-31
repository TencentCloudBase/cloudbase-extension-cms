import { Module, Global } from '@nestjs/common'
import { CloudBaseProvider } from './cloudbase'

/**
 * register libs as global providers
 */
@Global()
@Module({
    exports: [CloudBaseProvider],
    providers: [CloudBaseProvider]
})
export class GlobalLibModule {}
