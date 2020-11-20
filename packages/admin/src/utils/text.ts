import { message } from 'antd'

/**
 * 拷贝到剪切板
 * @param value
 */
export function copyToClipboard(value: string) {
  const textarea = document.createElement('textarea')
  document.body.appendChild(textarea)

  let textNode = document.createTextNode(value)
  textarea.appendChild(textNode)
  textarea.select()

  if (document.execCommand('copy')) {
    document.execCommand('copy')
    message.success('复制到剪切板成功')
  } else {
    message.error('复制到剪切板失败')
  }
  document.body.removeChild(textarea)
}
