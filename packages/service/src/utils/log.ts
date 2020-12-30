import pino from 'pino'
import { isRunInContainer } from './cloudbase'
import { isDevEnv } from './tools'

export const logger = isRunInContainer()
  ? pino({
      timestamp: isDevEnv() ? false : pino.stdTimeFunctions.isoTime,
      base: {
        hostname: false,
      },
      // 云函数中按行打印
      prettyPrint: isDevEnv() ? { colorize: true, ignore: 'time,hostname,pid' } : false,
    })
  : console
