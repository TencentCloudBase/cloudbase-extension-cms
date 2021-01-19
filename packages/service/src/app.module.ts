import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BodySerialize } from '@/middlewares/converter.middleware'
import { AuthModule } from './modules/auth/auth.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { UserModule } from './modules/user/user.module'
import { RoleModule } from './modules/role/role.module'
import { SettingModule } from './modules/setting/setting.module'
import { ApiModule } from './modules/api.module'
import { GlobalModule } from './global.module'

@Module({
  imports: [
    ApiModule,
    GlobalModule,
    AuthModule,
    UserModule,
    ProjectsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.local' : '.env',
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
