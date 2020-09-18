import React, { useEffect } from 'react'
import VditorX from 'vditor'
import 'vditor/dist/index.css'
import { isDevEnv } from '@/utils'

export const MarkdownEditor: React.FC<{
  value?: any
  key: string
  onChange?: (...args: any) => void
}> = (props) => {
  const { value, key = 'default', onChange = (...args: any) => {} } = props

  useEffect(() => {
    // eslint-disable-next-line
    new VditorX(`${key}-editor`, {
      value,
      input: (text, html) => {
        onChange(text)
      },
      upload: {
        url: isDevEnv()
          ? '/api/v1.0/upload'
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
  }, [])

  return <div id={`${key}-editor`} />
}

export default MarkdownEditor
