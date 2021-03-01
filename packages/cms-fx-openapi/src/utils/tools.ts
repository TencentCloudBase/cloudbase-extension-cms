import crypto from 'crypto'

export const isDevEnv = () =>
  process.env.NODE_ENV === 'development' && !process.env.TENCENTCLOUD_RUNENV

export const md5Base64 = (text: string) => crypto.createHash('md5').update(text).digest('base64')

export const base64 = (text: string) => Buffer.from(text).toString('base64')
