import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

export const unixToDateString = (date: string) =>
  dayjs(Number(date) * 1000).format('YYYY-MM-DD HH:mm:ss')
