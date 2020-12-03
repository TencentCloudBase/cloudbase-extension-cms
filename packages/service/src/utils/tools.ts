import { customAlphabet } from 'nanoid'

export const isDevEnv = () =>
  process.env.NODE_ENV === 'development' && !process.env.TENCENTCLOUD_RUNENV

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-',
  32
)

export const randomId = (len = 32) =>
  customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', len)()
