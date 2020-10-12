/**
 * 将字符串保存为文件并下载
 * @param content
 * @param fileName
 */
export const saveContentToFile = (content: string, fileName: string) => {
  return saveFile(new Blob([content]), fileName)
}

/**
 * 浏览器保存文件到本地
 * @param file
 * @param fileName
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
