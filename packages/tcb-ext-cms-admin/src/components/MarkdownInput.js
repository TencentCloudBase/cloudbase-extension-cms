import React, { useEffect } from 'react'
import VditorX from 'vditor'
import { useInput } from 'react-admin'

import 'vditor/dist/index.css'

export default function Vditor(props) {
  const { source, record = {} } = props
  const {
    input: { onChange }
  } = useInput(props)
  const value = record[source]

  useEffect(() => {
    const vditor = new VditorX('editor', {
      value,
      after: () => {
        if (props.onInit) props.onInit(vditor.getValue())
        if (props.disabled) vditor.disabled()
      },
      input: (text, html) => {
        onChange(text)
      },
      select: () => {
        if (props.onSelect) props.onSelect(vditor.getSelection(), vditor.getValue())
      },
      upload: {
        url: `https://${window.cmsEnvConfig.envId}.service.tcloudbase.com/tcb-ext-cms-service/upload`
      },
      theme: props.darkMode ? 'dark' : 'classic',
      placeholder: props.placeholder ?? '欢迎使用云开发 CMS Markdown编辑器',
      mode: 'sv',
      minHeight: 600,
      debugger: true,
      typewriterMode: false,
      cache: {
        enable: false
      }
    })
  }, []) // eslint-disable-line

  return <div id="editor" />
}
