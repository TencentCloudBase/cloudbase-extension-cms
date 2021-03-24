import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

export const getFullDate = (v = Date.now()) => moment(v).format('YYYY-MM-DD')

export const getDateValue = (v?: string | number) => moment(v).valueOf()

export const getYear = () => moment().year()
export const getMonth = () => moment().format('MM')
export const getDay = () => moment().format('DD')

export const getUnixInSecond = (v: string | number) => moment(v).unix()

export const Moment = moment

/**
 * 格式化保存到数据库中的时间
 * @param v
 * @param dateType
 * @param valueType
 */
export const formatStoreTimeByType = (
  v: string,
  dateType?: 'timestamp-ms' | 'timestamp-s' | 'date' | 'string',
  valueType?: string
) => {
  // 默认以 unix timestamp ms 存储
  let formatDate: number | string = moment(v).valueOf()

  // timestamp
  if (dateType === 'timestamp-s') {
    formatDate = moment(v).unix()
  }

  // date 对象
  if (dateType === 'date') {
    formatDate = moment(v).toJSON()
  }

  // 字符串
  if (dateType === 'string') {
    // 空字符串无法转换成时间
    if (v === '') {
      formatDate = v
    } else {
      formatDate =
        valueType === 'Date'
          ? moment(v).format('YYYY-MM-DD')
          : moment(v).format('YYYY-MM-DD HH:mm:ss')
    }
  }

  return formatDate
}

/**
 * 格式化展示的时间
 * @param v
 * @param dateType
 * @param valueType
 */
export const formatDisplayTimeByType = (
  v: string | number,
  dateType?: 'timestamp-ms' | 'timestamp-s' | 'date' | 'string',
  valueType?: DateFieldType
) => {
  // Time 类型
  if (valueType === 'Time') {
    return timestampToString(v, dateType)
  }

  const format = valueType === 'Date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'

  // 字符串
  if (dateType === 'string') {
    return v
  }

  if (dateType === 'timestamp-s') {
    return moment(Number(v) * 1000).format(format)
  }

  // 使用 number 转换可能的字符串
  if (dateType === 'timestamp-ms') {
    return moment(Number(v)).format(format)
  }

  return moment(v).format(format)
}

export const timestampToString = (time: number | string, type: DateFormatType = 'timestamp-ms') => {
  const dateString = getFullDate()
  const todayTime = moment(dateString).valueOf()
  let timeString

  // 字符串直接返回
  if (type === 'string') {
    timeString = time
  } else if (type === 'timestamp-s') {
    let num = Number(time) * 1000
    timeString = moment(todayTime + num).format('HH:mm:ss')
  } else {
    timeString = moment(todayTime + Number(time)).format('HH:mm:ss')
  }

  return timeString
}

/**
 * 获取昨天的日期
 */
export const getYesterday = () => {
  return moment().subtract(1, 'day').format('YYYY-MM-DD')
}

export const getHour = () => {
  return moment().hour()
}
