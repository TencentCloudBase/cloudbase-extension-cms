import isEqual from 'lodash.isequal'

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

/**
 * 比较 doc 获取变更的值
 */
export const getDocChangedValues = (oldDoc: Object, newDoc: Object): any => {
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
