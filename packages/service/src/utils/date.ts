import { CollectionV2 } from '@/constants'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import _ from 'lodash'
import { getCloudBaseApp } from './cloudbase'
import { isDateType } from './field'

dayjs.locale('zh-cn')

export const dateToNumber = (date?: string) => {
  // 毫秒
  const unixTime = dayjs(date).valueOf()

  if (isNaN(unixTime)) {
    throw new Error(`Invalid Date Type: ${date}`)
  }

  return unixTime
}

// 获取 2020-08-08 格式的时间
export const getFullDate = (date?: string) => {
  // 毫秒
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化 data 中的时间类型
export const formatPayloadDate = async (payload: Object | Object[], collectionName: string) => {
  const app = getCloudBaseApp()
  const {
    data: [schema],
  }: { data: Schema[] } = await app
    .database()
    .collection(CollectionV2.Schemas)
    .where({
      collectionName,
    })
    .get()

  // Webhook 直接返回
  if (!schema) return payload

  const dateFields = schema.fields.filter(
    (field) => isDateType(field.type) && field.dateFormatType === 'date'
  )

  if (Array.isArray(payload)) {
    return payload.map((record) => {
      dateFields.forEach((field) => {
        record[field.name] = new Date(record[field.name])
      })
      return record
    })
  }

  dateFields.forEach((field) => {
    payload[field.name] = dayjs(payload[field.name]).toDate()
  })

  return payload
}
