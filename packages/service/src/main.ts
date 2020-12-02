import helmet from 'helmet'
import express from 'express'
import bodyParser from 'body-parser'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express'

import { AppModule } from './app.module'
import { GlobalRoleGuard } from './guards/role.guard'
import { GlobalAuthGuard } from './guards/auth.guard'

import { TimeCost } from './interceptors/timecost.interceptor'
import { TimeoutInterceptor } from './interceptors/timeout.interceptor'
import { ContextInterceptor } from './interceptors/context.interceptor'

import { AllExceptionsFilter } from './exceptions.filter'
import config from './config'
import { isRunInServerMode } from './utils'

const expressApp = express()
const adapter = new ExpressAdapter(expressApp)
const port = process.env.PORT || 5000

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter, {
    logger: ['error', 'warn'],
  })

  // Security
  app.use(helmet())

  // 参数校验
  app.useGlobalPipes(new ValidationPipe())

  // 登录校验
  app.useGlobalGuards(new GlobalAuthGuard())
  app.useGlobalGuards(new GlobalRoleGuard())

  // 请求 body 大小限制
  app.use(bodyParser.raw({ limit: '50mb' }))

  // 耗时
  app.useGlobalInterceptors(new TimeCost())

  // 超时时间
  app.useGlobalInterceptors(new TimeoutInterceptor(config.timeout))

  // context 处理
  app.useGlobalInterceptors(new ContextInterceptor())

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

  // API 版本
  app.setGlobalPrefix(config.globalPrefix)

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
    console.log(`App listen on http://localhost:${port}`)
  })
}
