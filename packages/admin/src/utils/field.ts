import { SYSTEM_FIELDS } from '@/common'

// 是否为 date 类型
export const isDateType = (type: string): boolean => type === 'Date' || type === 'DateTime'

// 是否为资源类型：文件、图片、多媒体
export const isAssetType = (type: SchemaFieldType): boolean =>
  type === 'File' || type === 'Image' || type === 'Media'

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
    Connect: 200,
  }

  const { displayName = '', type = 'String' } = field
  // 计算列宽度
  const nameWidth = displayName.length * 25

  let width: number
  if (TypeWidthMap[type]) {
    width = nameWidth > TypeWidthMap[type] ? nameWidth : TypeWidthMap[type]
  } else {
    width = nameWidth > 120 ? nameWidth : 120
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
  // 优先级最高
  _id: -1,
  // 优先级：0 -> 自定义字段
  // 优先级最后
  _createTime: 1,
  _updateTime: 2,
}

const fieldOrder = (field: SchemaField) => {
  return SYSTEM_FIELD_ORDER[field.name] || 0
}

const SchemaCustomFieldKeys = ['docCreateTimeField', 'docUpdateTimeField']

/**
 * 获取 Schema 中的全部系统字段，并排序
 */
export const getSchemaSystemFields = (schema: Schema) => {
  const fields = schema?.fields
  if (!fields?.length) return SYSTEM_FIELDS

  // schema 中包含的系统字段
  const systemFieldsInSchema = fields.filter((_) => _.isSystem)

  SYSTEM_FIELDS.forEach((field) => {
    if (
      !systemFieldsInSchema.find(
        (_) =>
          _.name === field.name ||
          (SchemaCustomFieldKeys.some((key) => _.name === schema[key]) && _.id === field.id)
      )
    ) {
      systemFieldsInSchema.push(field)
    }
  })

  return systemFieldsInSchema.sort((prev, next) => {
    return fieldOrder(prev) - fieldOrder(next)
  })
}

/**
 * 过滤 schema 中的系统字段，返回用户自定义的字段，并排序
 */
export const getSchemaCustomFields = (schema: Schema) => {
  return (
    schema?.fields?.filter((_) => !_.isSystem).sort((prev, next) => prev.order - next.order) || []
  )
}

/**
 * 获取 Schema 中缺失的系统字段数组
 * @param schema
 */
export const getMissingSystemFields = (schema: Schema) => {
  const fields = schema?.fields
  if (!fields?.length) return SYSTEM_FIELDS

  // schema 中包含的系统字段
  const missingSystemFields: SchemaField[] = []
  const systemFieldsInSchema = fields.filter((_) => _.isSystem)

  SYSTEM_FIELDS.forEach((field) => {
    if (
      !systemFieldsInSchema.find(
        (_) =>
          _.name === field.name ||
          (SchemaCustomFieldKeys.some((key) => _.name === schema[key]) && _.id === field.id)
      )
    ) {
      missingSystemFields.push(field)
    }
  })

  return missingSystemFields.sort((prev, next) => {
    return fieldOrder(prev) - fieldOrder(next)
  })
}

/**
 * 获取可以配置的系统字段
 * @param options
 */
export const getSystemConfigurableFields = (options: {
  docCreateTimeField?: string
  docUpdateTimeField?: string
}): any[] => {
  const { docCreateTimeField = '_createTime', docUpdateTimeField = '_updateTime' } = options

  return [
    {
      displayName: '创建时间',
      id: '_createTime',
      name: docCreateTimeField,
      type: 'DateTime',
      isSystem: true,
      dateFormatType: 'timestamp-ms',
      description: '系统字段，请勿随意修改',
    },
    {
      displayName: '修改时间',
      id: '_updateTime',
      name: docUpdateTimeField,
      type: 'DateTime',
      isSystem: true,
      dateFormatType: 'timestamp-ms',
      description: '系统字段，请勿随意修改',
    },
  ]
}

/**
 * 获取 schema 中的全部字段，包含系统字段
 * @param schema
 */
export const getSchemaAllFields = (schema: Schema) => {
  const allFields = schema?.fields.slice()
  if (!allFields?.length) return SYSTEM_FIELDS

  // schema 已中包含的系统字段
  const systemFieldsInSchema = allFields.filter((_) => _.isSystem)

  SYSTEM_FIELDS.forEach((field) => {
    if (
      !systemFieldsInSchema.find(
        (_) =>
          _.name === field.name ||
          (SchemaCustomFieldKeys.some((key) => _.name === schema[key]) && _.id === field.id)
      )
    ) {
      allFields.push(field)
    }
  })

  return allFields.sort((prev, next) => {
    return fieldOrder(prev) - fieldOrder(next)
  })
}
