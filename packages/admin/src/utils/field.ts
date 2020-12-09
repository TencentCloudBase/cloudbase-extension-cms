import { SYSTEM_FIELDS } from '@/common'

// 是否为 date 类型
export const isDateType = (type: string): boolean => type === 'Date' || type === 'DateTime'

// 是否为资源类型：文件或图片
export const isResourceType = (type: string): boolean => type === 'File' || type === 'Image'

// 计算 field 占据的宽度
export const calculateFieldWidth = (field: Partial<SchemaField>) => {
  const TypeWidthMap = {
    String: 150,
    MultiLineString: 150,
    Number: 150,
    Boolean: 100,
    DateTime: 150,
    File: 150,
    Image: 200,
    RichText: 150,
    Markdown: 150,
    Connect: 250,
  }

  const { displayName = '', type = 'String', isMultiple } = field
  // 计算列宽度
  const nameWidth = displayName.length * 25

  let width
  if (TypeWidthMap[type]) {
    width = nameWidth > TypeWidthMap[type] ? nameWidth : TypeWidthMap[type]
  } else {
    width = nameWidth > 150 ? nameWidth : 150
  }

  if (isMultiple && type === 'Image') {
    width += 50
  }

  return width
}

// 格式化搜索参数
export const formatSearchData = (schema: Schema, params: Record<string, any>) => {
  const { fields } = schema

  return Object.keys(params).reduce((ret, key) => {
    const field = fields.find((_) => _.name === key)

    if (!field) {
      return {
        ...ret,
        [key]: params[key],
      }
    }

    let value = params[key]

    // 格式化字符串
    if (field.type === 'Number') {
      value = Number(value)
    }

    if (field.type === 'Boolean') {
      value = Boolean(value)
    }

    return {
      ...ret,
      [key]: value,
    }
  }, {})
}

// 字段排序，数字越大，越靠后
const SYSTEM_FIELD_ORDER = {
  _createTime: 1,
  _updateTime: 2,
}

const fieldOrder = (field: SchemaField) => {
  return SYSTEM_FIELD_ORDER[field.name] || 0
}

// 获取 Schema 中的系统字段，并排序
export const getSchemaSystemFields = (fields: SchemaField[]) => {
  if (!fields?.length) return SYSTEM_FIELDS

  return fields
    .filter((_) => _.isSystem)
    .concat(SYSTEM_FIELDS)
    .filter((field, i, arr) => arr.findIndex((_) => _.name === field.name) === i)
    .sort((prev, next) => {
      return fieldOrder(prev) - fieldOrder(next)
    })
}
