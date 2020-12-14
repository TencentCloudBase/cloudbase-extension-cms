import React, { useEffect } from 'react'
import VditorX from 'vditor'
import 'vditor/dist/index.css'
import { getAuthHeader, isDevEnv } from '@/utils'

// 默认的工具栏
const DefaultToolbar = [
  'emoji',
  'headings',
  'bold',
  'italic',
  'strike',
  'link',
  '|',
  'list',
  'ordered-list',
  'check',
  'outdent',
  'indent',
  '|',
  'quote',
  'line',
  'code',
  'inline-code',
  'insert-before',
  'insert-after',
  '|',
  'upload',
  'record',
  'table',
  '|',
  'undo',
  'redo',
  '|',
  'fullscreen',
  'edit-mode',
  {
    name: 'more',
    toolbar: [
      'both',
      'code-theme',
      'content-theme',
      'export',
      'outline',
      'preview',
      'devtools',
      'info',
      'help',
    ],
  },
]

const getToolBarWithoutUpload = () => {
  DefaultToolbar.splice(
    DefaultToolbar.findIndex((_) => _ === 'upload'),
    1
  )
  return DefaultToolbar
}

// 在小程序侧隐藏上传文件的选项
const toolbar: any[] = WX_MP ? getToolBarWithoutUpload() : DefaultToolbar

export const MarkdownEditor: React.FC<{
  id: number
  value?: any
  onChange?: (...args: any) => void
}> = (props) => {
  const { value, id = 'default', onChange = (...args: any) => {} } = props

  const authHeader = getAuthHeader()

  useEffect(() => {
    // eslint-disable-next-line
    new VditorX(`${id}-editor`, {
      value,
      toolbar,
      input: (text, html) => {
        onChange(text)
      },
      upload: {
        headers: authHeader,
        url: isDevEnv()
          ? '/api/v1.0/upload'
          : SERVER_MODE
          ? `https://${window.TcbCmsConfig.containerAccessPath}/api/v1.0/upload`
          : `https://${window.TcbCmsConfig.cloudAccessPath}/api/v1.0/upload`,
      },
      theme: 'classic',
      placeholder: '欢迎使用云开发 CMS Markdown编辑器',
      mode: 'sv',
      minHeight: 600,
      debugger: false,
      typewriterMode: false,
      cache: {
        enable: false,
      },
    })
  }, [authHeader?.['x-cloudbase-credentials']])

  return <div id={`${id}-editor`} />
}

export default MarkdownEditor
