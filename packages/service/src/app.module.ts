import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BodySerialize } from '@/middlewares/converter.middleware'
import { ProjectsModule } from './modules/projects/projects.module'
import { UserModule } from './modules/user/user.module'
import { RoleModule } from './modules/role/role.module'
import { SettingModule } from './modules/setting/setting.module'
import { ApisModule } from './modules/apis/apis.module'
import { GlobalModule } from './global.module'

@Module({
  imports: [
    ApisModule,
    GlobalModule,
    UserModule,
    ProjectsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'WX' in process.env ? '.env.wx.local' : '.env.local',
    }),
    RoleModule,
    SettingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodySerialize).forRoutes('*')
  }
}
