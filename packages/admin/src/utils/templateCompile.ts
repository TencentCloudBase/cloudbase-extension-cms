/**
 * 模板引擎，替换 {} 模版变量，用法：
 * templateCompile('The mobile number of {name} is {phone.mobile}', {
 * 	name: 'name',
 * 	phone: {
 * 		mobile: '609 24 363'
 * 	}
 * });
 */
export const templateCompile = (template: string, data: Record<string, any>) => {
  // 匹配字符串
  const braceRegex = /{(\d+|[a-z$_][a-z\d$_]*?(?:\.[a-z\d$_]*?)*?)}/gi

  return template.replace(braceRegex, (_, key) => {
    let result = data

    for (const property of key.split('.')) {
      result = result ? result[property] : ''
    }

    return String(result)
  })
}
