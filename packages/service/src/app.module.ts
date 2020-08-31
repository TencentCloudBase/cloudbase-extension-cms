import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { BodyConverter } from '@/middlewares/converter.middleware'
import { CloudBaseModule } from '@/dynamic_modules/cloudbase'
import { FileModule } from './modules/file/file.module'
import { AuthModule } from './modules/auth/auth.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { UserModule } from './modules/user/user.module'
import { RoleModule } from './modules/role/role.module'
import { RequestTracking } from './services/requestTracking'

@Module({
  imports: [
    AuthModule,
    FileModule,
    UserModule,
    ProjectsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.local' : '.env',
    }),
    CloudBaseModule.forRoot({
      envId: process.env.TCB_ENVID,
      secretId: process.env.SECRETID,
      secretKey: process.env.SECRETKEY,
    }),
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService, RequestTracking],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodyConverter).forRoutes('*')
  }
}
