import { randomId } from '@/utils'
import { Request, Response } from 'express'
import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class BodySerialize implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    // 将 seqId 添加到 header 中
    res.header('x-seqid', randomId(16).toString())
    // 记录请求开始时间
    res.locals.cost = Date.now()

    // serverless-http 框架会将 string 类型的字符串转换成 stream
    // 将被转换成 stream 的 event.body 转换成对象
    if (Buffer.isBuffer(req.body)) {
      const body = req.body.toString()
      try {
        req.body = JSON.parse(body)
      } catch (error) {
        // ignore error
      }
    }

    // 打印请求信息
    console.info(`${req.method} ${req.originalUrl}`)
    console.info('请求 Body', req.body)

    next()
  }
}
