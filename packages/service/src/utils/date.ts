import R from 'ramda'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { getCollectionSchema } from './cloudbase'
import { isDateType } from './field'

dayjs.locale('zh-cn')

export const dayJS = dayjs

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

/**
 * 获取当前时间的 unix timestamp 形式
 */
export const getUnixTimestamp = () => dayjs().unix()

/**
 * 获取 2020-08-08 格式型的时间
 */
export const getFullDate = (date?: string) => {
  // 毫秒
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化 data 中的时间类型，转换成 Native Date 类型
 */
export const formatPayloadDate = async (
  payload: Object | Object[],
  collectionName: string,
  docSchema?: Schema
) => {
  const schema = docSchema || (await getCollectionSchema(collectionName))

  // Webhook，或没有 Schema 信息，直接返回
  if (!schema) return payload

  // schema 中的 'date' 时间类型
  const dateFields = R.filter(
    R.where({ type: isDateType, dateFormatType: R.equals('date') }),
    schema.fields
  )

  // 不存在需要格式化的时间字段
  if (R.isEmpty(dateFields)) return payload

  // payload 为数组时
  if (Array.isArray(payload)) {
    return payload.map((record) => {
      dateFields.forEach((field) => {
        // 只有存在值时才格式化
        if (typeof record[field.name] !== 'undefined') {
          record[field.name] = dayjs(record[field.name]).toDate()
        }
      })
      return record
    })
  }

  // payload 为 Object
  // 只有存在值时才格式化
  dateFields.forEach((field) => {
    if (typeof payload[field.name] !== 'undefined') {
      payload[field.name] = dayjs(payload[field.name]).toDate()
    }
  })

  return payload
}

/**
 * 根据时间存储类型格式化时间
 * @param v
 * @param dateType
 */
export const formatTimeByType = (
  dateType: 'timestamp-ms' | 'timestamp-s' | 'date' | 'string',
  v: string | number = Date.now()
) => {
  // 默认以 unix timestamp ms 存储
  let formatDate: number | string | Date = dayjs(v).valueOf()

  // timestamp
  if (dateType === 'timestamp-s') {
    formatDate = dayjs(v).unix()
  }

  // date 对象
  if (dateType === 'date') {
    formatDate = dayjs(v).toDate()
  }

  // 字符串
  if (dateType === 'string') {
    formatDate = dayjs(v).format('YYYY-MM-DD HH:mm:ss')
  }

  return formatDate
}
