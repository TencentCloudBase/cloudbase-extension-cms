import pino from 'pino'
import { Signale } from 'signale'
import { isRunInContainer } from './cloudbase'
import { isDevEnv } from './tools'

const pinoLogger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    hostname: false,
  },
})

// 本地开发和云函数，输出流
const signaleLogger = new Signale({
  types: {
    info: {
      color: 'cyanBright',
    },
  },
  config: {
    displayDate: !isDevEnv(),
    displayFilename: true,
    displayTimestamp: !isDevEnv(),
  },
})

export const logger = isRunInContainer() ? pinoLogger : signaleLogger
