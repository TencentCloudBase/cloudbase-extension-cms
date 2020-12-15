/**
 * 将字符串保存为文件并下载
 */
export const saveContentToFile = (content: string, fileName: string) => {
  return saveFile(new Blob([content]), fileName)
}

/**
 * 浏览器保存文件到本地
 */
export const saveFile = (file: Blob, fileName: string) => {
  if (window.navigator.msSaveOrOpenBlob) {
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, fileName)
  } else {
    // 其他
    const a = document.createElement('a')
    const url = URL.createObjectURL(file)

    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()

    setTimeout(function () {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 0)
  }
}

/**
 * 读取文件，获取文件内容
 */
export const readFile = (file: Blob): Promise<string> => {
  const fileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = (e) => {
      resolve(e.target?.result as string)
    }

    fileReader.onerror = reject
    fileReader.readAsText(file)
  })
}
