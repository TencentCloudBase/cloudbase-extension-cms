import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

/**
 * 获取当前时间的 unix timestamp 形式
 */
export const getUnixTimestamp = () => dayjs().unix()
