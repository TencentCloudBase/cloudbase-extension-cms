/**
 * 拷贝到剪切板
 * @param value
 */
export function copyToClipboard(str: string, execCommand?: Document['execCommand']) {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', 'false')
  el.setAttribute('contenteditable', 'true')
  el.style.position = 'absolute'
  el.style.left = '-99999px'
  document.body.append(el)

  // 保存原有的选择区域
  const selected =
    (document.getSelection()?.rangeCount || -1) > 0 ? document.getSelection()?.getRangeAt(0) : false
  el.select()
  el.setSelectionRange(0, el.textLength) // iOS 中使用 select() 函数无效
  execCommand?.call(document, 'copy')
  document.execCommand('copy')

  document.body.removeChild(el)

  if (selected) {
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(selected)
  }
}
