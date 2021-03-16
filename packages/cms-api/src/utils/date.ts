import { Collection } from '@/constants'
import { getCloudBaseApp } from './cloudbase'

export const isDateType = (type: string): boolean => type === 'Date' || type === 'DateTime'

// 格式化 data 中的时间类型
export const formatPayloadDate = async (
  payload: Object | Object[],
  collectionName: string
): Promise<Object | Object[]> => {
  const app = getCloudBaseApp()
  const {
    data: [schema],
  }: { data: Schema[] } = await app
    .database()
    .collection(Collection.Schemas)
    .where({
      collectionName,
    })
    .get()

  // Webhook 直接返回
  if (!schema) return payload

  const dateFields = schema.fields.filter(
    (field) => isDateType(field.type) && field.dateFormatType === 'date'
  )

  // 不存在需要格式化的时间字段
  if (!dateFields.length) return payload

  if (Array.isArray(payload)) {
    return payload.map((record) => {
      dateFields.forEach((field) => {
        record[field.name] = new Date(record[field.name])
      })
      return record
    })
  }

  dateFields.forEach((field) => {
    payload[field.name] = new Date(payload[field.name])
  })

  return payload
}
