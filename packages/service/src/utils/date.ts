import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export const dateToNumber = (date?: string) => {
    // 毫秒
    const unixTime = dayjs(date).valueOf()

    if (isNaN(unixTime)) {
        throw new Error(`Invalid Date Type: ${date}`)
    }

    return unixTime
}

console.log(dateToNumber())
