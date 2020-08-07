import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { BodyConverter } from '@/middlewares/converter.middleware'
import { CloudBaseModule } from '@/dynamic_modules/cloudbase'
import { SchemaModule } from './modules/schema/schema.module'
import { FileModule } from './modules/file/file.module'
import { AuthModule } from './modules/auth/auth.module'
import { ProjectModule } from './modules/project/project.module'
import { ContentModule } from './modules/content/content.module'
import { UserModule } from './modules/user/user.module'

@Module({
    imports: [
        AuthModule,
        FileModule,
        UserModule,
        SchemaModule,
        ProjectModule,
        ContentModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'development' ? '.env.local' : '.env'
        }),
        CloudBaseModule.forRoot({
            envId: process.env.TCB_ENVID,
            secretId: process.env.SECRETID,
            secretKey: process.env.SECRETKEY
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
