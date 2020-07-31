import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export const dateToNumber = (date: string) => {
    return dayjs(date).valueOf()
}
