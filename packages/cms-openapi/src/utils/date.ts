import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.locale('zh-cn')
dayjs.tz.setDefault('Asia/Shanghai')

export const unixToDateString = (date: string | number) =>
  dayjs(Number(date) * 1000)
    .tz('Asia/Shanghai')
    .format('YYYY-MM-DD HH:mm:ss')
