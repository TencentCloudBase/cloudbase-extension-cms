import jsonExport from 'jsonexport'
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
