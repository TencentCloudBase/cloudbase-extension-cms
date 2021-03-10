/**
 * 处理内容文档
 */
export const getDocInitialValues = (action: string, schema: Schema, selectedContent: any) => {
  const initialValues =
    action === 'create'
      ? schema?.fields?.reduce((prev, field) => {
          let { type, defaultValue } = field
          // 布尔值默认为 false
          if (type === 'Boolean' && typeof defaultValue !== 'boolean') {
            defaultValue = false
          }
          return {
            ...prev,
            [field.name]: defaultValue,
          }
        }, {})
      : selectedContent

  if (action === 'edit') {
    schema?.fields?.forEach((field) => {
      let { type, name, isMultiple } = field

      const fieldValue = selectedContent[name]

      // 布尔值默认为 false
      if (type === 'Boolean' && typeof fieldValue !== 'boolean') {
        selectedContent[name] = false
      }

      // 如果字段是 multiple 类型，将异常的字符串值，转换为正常的数组
      if (isMultiple && typeof fieldValue === 'string') {
        selectedContent[name] = [fieldValue]
      }
    })
  }

  return initialValues
}
