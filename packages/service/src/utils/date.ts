import R from 'ramda'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { getCollectionSchema } from './cloudbase'
import { isDateType } from './field'

dayjs.locale('zh-cn')

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
 * 获取 2020-08-08 格式的时间
 */
export const getFullDate = (date?: string) => {
  // 毫秒
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化 data 中的时间类型，转换成 Native Date 类型
 */
export const formatPayloadDate = async (payload: Object | Object[], collectionName: string) => {
  const schema = await getCollectionSchema(collectionName)

  // Webhook，或没有 Schema 信息，直接返回
  if (!schema) return payload

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
        record[field.name] = dayjs(record[field.name]).toDate()
      })
      return record
    })
  }

  // payload 为 Object
  dateFields.forEach((field) => {
    payload[field.name] = dayjs(payload[field.name]).toDate()
  })

  return payload
}
