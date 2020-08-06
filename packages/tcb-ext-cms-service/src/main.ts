import helmet from 'helmet'
import express from 'express'
import bodyParser from 'body-parser'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express'

import { AppModule } from './app.module'
import { GlobalAuthGuard } from './guards/auth'
import { TimeoutInterceptor } from './interceptors/timeout'
import { AllExceptionsFilter } from './exception'

const expressApp = express()
const adapter = new ExpressAdapter(expressApp)
const port = process.env.PORT || 5000

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose']
  })

  // 安全
  app.use(helmet())
  // 登录校验
  app.useGlobalGuards(new GlobalAuthGuard())

  // 请求 body 大小限制
  app.use(bodyParser.raw({ limit: '50mb' }))

  // 超时时间
  app.useGlobalInterceptors(new TimeoutInterceptor(5000))
  // 错误处理
  app.useGlobalFilters(new AllExceptionsFilter())

  // cors
  app.enableCors({
    origin: (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true)
    },
    maxAge: 600,
    credentials: true
  })

  // 隐藏 x-powered-by: express header
  app.disable('x-powered-by')

  // 兼容云函数与本地开发
  if (process.env.NODE_ENV === 'development') {
    await app.listen(port)
  } else {
    await app.init()
  }

  return expressApp
}

if (process.env.NODE_ENV === 'development') {
  bootstrap().then(() => {
    console.log(`App listen on http://localhost:${port}`)
  })
}
