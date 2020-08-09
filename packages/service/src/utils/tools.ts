import { customAlphabet } from 'nanoid'

export const isDev = () => process.env.NODE_ENV === 'development'

export const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-',
    32
)
