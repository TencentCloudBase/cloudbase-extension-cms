import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { BodyConverter } from '@/middlewares'
import { ModelModule } from './modules/model/model.module'
import { FileModule } from './modules/file/file.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ModelModule,
    FileModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodyConverter).forRoutes('*')
  }
}
