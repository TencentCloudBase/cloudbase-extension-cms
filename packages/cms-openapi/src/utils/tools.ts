import crypto from 'crypto'
import { customAlphabet } from 'nanoid'

export const isDevEnv = () =>
  process.env.NODE_ENV === 'development' && !process.env.TENCENTCLOUD_RUNENV

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-',
  32
)

export const md5Base64 = (text: string) => crypto.createHash('md5').update(text).digest('base64')

export const base64 = (text: string) => Buffer.from(text).toString('base64')
