import { message } from 'antd'
import request from 'umi-request'

/**
 * 将字符串保存为文件并下载
 */
export const saveContentToFile = (content: string, fileName: string, type = 'application/json') => {
  if (!/\.json$/.test(fileName) && type === 'application/json') {
    throw new Error('文件格式指定错误')
  }
  return saveFile(new Blob([content], { type }), fileName)
}

/**
 * 浏览器保存文件到本地
 */
export const saveFile = (file: Blob, fileName: string) => {
  if (window.navigator.msSaveOrOpenBlob) {
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, fileName)
  } else {
    const url = URL.createObjectURL(file)
    downloadFileFromUrl(url, fileName)
  }
}

/**
 * 通过链接下载文件
 */
export const downloadFileFromUrl = (url: string, fileName: string) => {
  // 创建一个链接
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()

  setTimeout(function () {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 0)
}

/**
 * 下载文件
 */
export const downloadAndSaveFile = async (url: string, fileName: string) => {
  try {
    const data = await request(url, {
      responseType: 'blob',
    })
    saveFile(data, fileName)
  } catch (e) {
    message.error(`下载文件失败：${e.message}`)
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
