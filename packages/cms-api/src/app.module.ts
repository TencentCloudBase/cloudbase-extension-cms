import { Module, MiddlewareConsumer, NestModule, Scope } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { BodyConverter } from '@/middlewares/converter.middleware'
import { ApiModule } from './api/api.module'
import { GlobalModule } from './global.module'

@Module({
  imports: [
    ApiModule,
    GlobalModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? ['.env', '.env.local'] : '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodyConverter).forRoutes('*')
  }
}
