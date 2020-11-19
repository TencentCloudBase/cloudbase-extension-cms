import moment from 'moment'
import 'moment/locale/zh-cn'

export const getFullDate = (v = Date.now()) => moment(v).format('YYYY-MM-DD')

export const getDateValue = (v?: string | number) => moment(v).valueOf()

export const formatTimeByType = (
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
