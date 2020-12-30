import moment from 'moment'
import 'moment/locale/zh-cn'

export const getFullDate = (v = Date.now()) => moment(v).format('YYYY-MM-DD')

export const getDateValue = (v?: string | number) => moment(v).valueOf()

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
    formatDate =
      valueType === 'Date'
        ? moment(v).format('YYYY-MM-DD')
        : moment(v).format('YYYY-MM-DD HH:mm:ss')
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
  valueType?: string
) => {
  const format = valueType === 'Date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'

  // 字符串
  if (dateType === 'string') {
    return v
  }

  if (dateType === 'timestamp-s') {
    return moment(Number(v) * 1000).format(format)
  }

  return moment(v).format(format)
}
