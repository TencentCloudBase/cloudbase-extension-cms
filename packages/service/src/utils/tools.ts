import _ from 'lodash'
import { customAlphabet } from 'nanoid'

export const isDevEnv = () =>
  process.env.NODE_ENV === 'development' && !process.env.TENCENTCLOUD_RUNENV

/**
 * 生成随机 id
 */
export const randomId = (len = 32) =>
  customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', len)()

/**
 * 检查 ele 不为 null，undefined，空数组，空对象，仅包含 null、undefined 的数组
 */
export const isNotEmpty = (ele: any | any[]) => {
  if (Array.isArray(ele)) {
    return !_.isEmpty(ele) && !_.isEmpty(ele.filter((_) => _))
  }

  return !_.isEmpty(ele)
}

/**
 * 休眠 tick 时间
 */
export const sleep = (tick: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, tick)
  })
}
