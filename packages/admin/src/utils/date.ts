import moment from 'moment'
import 'moment/locale/zh-cn'

export const getFullDate = (v = Date.now()) => moment(v).format('YYYY-MM-DD')

export const getDateValue = (v?: string | number) => moment(v).valueOf()

export const formatTimeByType = (v: string, type?: 'timestamp-ms' | 'timestamp-s' | 'date') => {
  // 默认以 unix timestamp ms 存储
  let formatDate: number | string = moment(v).valueOf()

  if (type === 'timestamp-s') {
    formatDate = moment(v).unix()
  }

  if (type === 'date') {
    formatDate = moment(v).toJSON()
  }

  return formatDate
}
