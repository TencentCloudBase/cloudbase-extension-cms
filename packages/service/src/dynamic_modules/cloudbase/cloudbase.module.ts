import { Module } from '@nestjs/common'
import { CloudBaseService } from './cloudbase.service'
import { CloudBaseConfig } from './types'

@Module({})
export class CloudBaseModule {
  static async forRoot(config: CloudBaseConfig) {
    return {
      global: true,
      module: CloudBaseModule,
      providers: [
        {
          provide: 'CLOUDBASE_CONFIG',
          useValue: config,
        },
        CloudBaseService,
      ],
      exports: [CloudBaseService],
    }
  }
}
