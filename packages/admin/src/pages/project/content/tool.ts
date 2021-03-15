import jsonExport from 'jsonexport'
import isEqual from 'lodash.isequal'
import { getFullDate, saveContentToFile, saveFile } from '@/utils'

/**
 * 格式化搜索参数，去除非法的搜搜字段
 */
export const formatSearchParams = (searchParams: Record<string, any>, currentSchema: Schema) =>
  searchParams
    ? Object.keys(searchParams)
        .filter((key) => currentSchema.fields?.some((field: SchemaField) => field.name === key))
        .reduce(
          (prev, key) => ({
            ...prev,
            [key]: searchParams[key],
          }),
          {}
        )
    : {}

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

/**
 * 比较 doc 获取变更的值
 */
export const getDocChangedValues = (oldDoc: Object, newDoc: Object): Object => {
  // doc 相等
  if (oldDoc === newDoc || isEqual(oldDoc, newDoc)) return newDoc

  // 按 key 比较
  const docKeys: string[] = Object.keys(newDoc)

  // 相同的值返回 null，否则返回 key，根据 key 获取变更的值
  return docKeys
    .map((key) => {
      if (isEqual(newDoc[key], oldDoc[key])) {
        return null
      } else {
        return key
      }
    })
    .filter((_) => _ !== null)
    .reduce((obj: any, key: any) => {
      obj[key] = newDoc[key]
      return obj
    }, {})
}
