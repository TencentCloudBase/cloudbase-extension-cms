import jsonExport from 'jsonexport'
import { getSchemaAllFields, getFullDate, saveContentToFile, saveFile } from '@/utils'

/**
 * 格式化搜索参数，去除非 schema 中定义的字段
 */
export const formatSearchParams = (searchParams: Record<string, any>, currentSchema: Schema) =>
  searchParams
    ? Object.keys(searchParams)
        .filter((key) =>
          getSchemaAllFields(currentSchema)?.some((field: SchemaField) => field.name === key)
        )
        .reduce(
          (prev, key) => ({
            ...prev,
            [key]: searchParams[key],
          }),
          {}
        )
    : {}

/**
 * 格式化 filter
 * 默认情况下，Protable 返回的所有 filter 值都是字符串
 * 数字类型的枚举值会过滤失败，需要格式化数字再检索
 */
export const formatFilter = (filter: Record<string, React.ReactText[]>, currentSchema: Schema) => {
  if (!filter) return {}

  return Object.keys(filter)
    .filter((key) => filter[key]?.length)
    .filter((key) => currentSchema.fields?.some((field: SchemaField) => field.name === key))
    .reduce(
      (prev, key) => ({
        ...prev,
        [key]: filter[key].map((_) => {
          const field = currentSchema.fields.find((field) => field.name === key)
          // 格式化 number 类型的枚举值
          if (field?.enumElementType === 'number') {
            return Number(_)
          }
          return _
        }),
      }),
      {}
    )
}

/**
 * 导出类型，支持 CSV 和 JSON 类型
 */
type ExportFileType = 'csv' | 'json'

/**
 * 将数据导出为 CSV 或 JSON
 */
export const exportData = async (data: any, fileType: ExportFileType) => {
  if (fileType === 'json') {
    await saveContentToFile(JSON.stringify(data), `cms-data-export-${getFullDate()}.json`)
  } else {
    const csv: any = await jsonExport(data)
    await saveFile(new Blob([csv], { type: 'text/csv' }), `cms-data-export-${getFullDate()}.csv`)
  }
}
