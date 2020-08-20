// 格式化搜索参数
export const formatSearchData = (schema: SchemaV2, params: Record<string, any>) => {
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
