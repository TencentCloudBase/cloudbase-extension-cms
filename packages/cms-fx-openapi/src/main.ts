import helmet from 'helmet'
import express from 'express'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { TimeoutInterceptor } from './interceptors/timeout.interceptor'
import { AllExceptionsFilter } from './exceptions.filter'
import { isRunInServerMode } from './utils'
import { TimeCost } from './interceptors/timecost.interceptor'
import { GlobalAuthGuard } from './guards'

const expressApp = express()
const adapter = new ExpressAdapter(expressApp)
const port = process.env.SERVER_PORT || 5003

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter, {
    logger: ['error', 'warn'],
  })

  // Security
  app.use(helmet())

  // 参数校验
  app.useGlobalPipes(
    // 将参数转换为 DTO 定义的类型
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  // 鉴权
  app.useGlobalGuards(new GlobalAuthGuard())

  // 超时时间
  app.useGlobalInterceptors(new TimeoutInterceptor())

  // 请求时间
  app.useGlobalInterceptors(new TimeCost())

  // 错误处理
  app.useGlobalFilters(new AllExceptionsFilter())

  // cors
  app.enableCors({
    origin: (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true)
    },
    maxAge: 600,
    credentials: true,
  })

  // hide x-powered-by: express header
  app.disable('x-powered-by')

  // 兼容云函数与本地开发
  if (isRunInServerMode()) {
    await app.listen(port)
  } else {
    await app.init()
  }

  return expressApp
}

if (isRunInServerMode()) {
  bootstrap().then(() => {
    console.log(`\n> 🚀 App listen on http://localhost:${port}`)
  })
}
