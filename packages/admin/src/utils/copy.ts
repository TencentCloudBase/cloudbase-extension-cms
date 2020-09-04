/**
 * 拷贝到剪切板
 * @param value
 */
export async function copyToClipboard(value: string) {
  return new Promise(function (resolve, reject) {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    let textNode = document.createTextNode(value)
    textarea.appendChild(textNode)
    textarea.select()

    if (document.execCommand('copy')) {
      document.execCommand('copy')
      resolve(true)
    } else {
      reject(new Error('复制失败'))
    }
    document.body.removeChild(textarea)
  })
}
