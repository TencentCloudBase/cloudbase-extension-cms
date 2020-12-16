import { parse } from 'querystring'

const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/

export const isUrl = (path: string): boolean => reg.test(path)

export const getPageQuery = () => {
  const { href } = window.location
  const qsIndex = href.indexOf('?')
  const sharpIndex = href.indexOf('#')

  if (qsIndex !== -1) {
    if (qsIndex > sharpIndex) {
      return parse(href.split('?')[1])
    }

    return parse(href.slice(qsIndex + 1, sharpIndex))
  }

  return {}
}

// 判断是否是开发环境
export const isDevEnv = () => process.env.NODE_ENV === 'development'

// 生成随机字符串
export const random = (len: number) => {
  const count = Math.ceil(Number(len) / 10) + 1
  let ret = ''
  for (let i = 0; i < count; i++) {
    ret += Math.random().toString(36).substr(2)
  }
  return ret.substr(0, len)
}

/**
 * 计算字符串的 hash 值
 */
export const hashCode = (str: string) => {
  let i = str.length
  let hash1 = 5381
  let hash2 = 52711

  while (i--) {
    const char = str.charCodeAt(i)
    hash1 = (hash1 * 33) ^ char
    hash2 = (hash2 * 33) ^ char
  }

  return (hash1 >>> 0) * 4096 + (hash2 >>> 0)
}
