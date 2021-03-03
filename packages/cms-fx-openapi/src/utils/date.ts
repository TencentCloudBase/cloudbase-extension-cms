import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

/**
 * 获取当前时间的 unix timestamp 形式
 */
export const getUnixTimestamp = () => dayjs().unix()

/**
 * 将时间转换成毫秒级的 unix timestamp Date.now()
 */
export const dateToUnixTimestampInMs = (date?: string) => {
  // 毫秒
  const unixTime = dayjs(date).valueOf()

  if (isNaN(unixTime)) {
    throw new Error(`Invalid Date Type: ${date}`)
  }

  return unixTime
}
