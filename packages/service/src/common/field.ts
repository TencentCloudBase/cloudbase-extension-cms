/**
 * 系统默认字段
 */
export const SYSTEM_FIELDS: any[] = [
  {
    displayName: '创建时间',
    id: '_createTime',
    name: '_createTime',
    type: 'DateTime',
    isSystem: true,
    dateFormatType: 'timestamp-ms',
    description: 'CMS 系统字段，请勿随意修改。通过 CMS 系统录入的数据会默认添加该字段',
  },
  {
    displayName: '修改时间',
    id: '_updateTime',
    name: '_updateTime',
    type: 'DateTime',
    isSystem: true,
    dateFormatType: 'timestamp-ms',
    description: 'CMS 系统字段，请勿随意修改。通过 CMS 系统录入的数据会默认添加该字段',
  },
]

// 字段排序，数字越大，越靠后
const SYSTEM_FIELD_ORDER = {
  _createTime: 1,
  _updateTime: 2,
}

const fieldOrder = (field: SchemaField) => {
  return SYSTEM_FIELD_ORDER[field.name] || 0
}

const SchemaCustomFieldKeys = ['docCreateTimeField', 'docUpdateTimeField']

// 获取 Schema 中的系统字段，并排序
export const getSchemaSystemFields = (schema: Schema) => {
  const fields = schema?.fields
  if (!fields?.length) return SYSTEM_FIELDS

  // schema 中包含的系统字段
  const systemFieldsInSchema = fields.filter((_) => _.isSystem)

  SYSTEM_FIELDS.forEach((field) => {
    if (
      !systemFieldsInSchema.find(
        (_) => _.name === field.name || SchemaCustomFieldKeys.some((key) => _.name === schema[key])
      )
    ) {
      systemFieldsInSchema.push(field)
    }
  })

  return systemFieldsInSchema.sort((prev, next) => {
    return fieldOrder(prev) - fieldOrder(next)
  })
}
