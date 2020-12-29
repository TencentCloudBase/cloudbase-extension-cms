import pino from 'pino'
import { isInSCF } from './cloudbase'
import { isDevEnv } from './tools'

export const logger = pino({
  timestamp: isDevEnv() ? false : pino.stdTimeFunctions.isoTime,
  base: {
    hostname: false,
  },
  // 云函数中按行打印
  prettyPrint: isDevEnv() || isInSCF() ? { colorize: true, ignore: 'time,hostname,pid' } : false,
})
