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

export const calculateFieldWidth = (field: SchemaField) => {
  const TypeWidthMap = {
    String: 150,
    MultiLineString: 150,
    Number: 150,
    Boolean: 100,
    DateTime: 150,
    File: 200,
    Image: 200,
    RichText: 150,
    Markdown: 150,
    Connect: 250,
  }

  const { displayName, type, isMultiple } = field
  // 计算列宽度
  const nameWidth = displayName.length * 25
  let width
  if (TypeWidthMap[type]) {
    width = nameWidth > TypeWidthMap[type] ? nameWidth : TypeWidthMap[type]
  } else {
    width = nameWidth > 150 ? nameWidth : 150
  }

  if (isMultiple) {
    width += 50
  }

  return width
}
