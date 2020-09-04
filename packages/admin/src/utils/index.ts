export * from './tool'
export * from './copy'
export * from './cloudbase'

// 驼峰转换下划线
function humpToLine(name: string) {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export function humpDataToLineData(rawData: Record<string, any>) {
  const newData = {}
  Object.keys(rawData).forEach((key: string) => {
    if (typeof rawData[key] === 'object') {
      newData[humpToLine(key)] = humpDataToLineData(rawData[key])
    } else {
      newData[humpToLine(key)] = rawData[key]
    }
  })

  return newData
}
