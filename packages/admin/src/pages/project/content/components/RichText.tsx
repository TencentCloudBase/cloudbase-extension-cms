import React, { useEffect, useState } from 'react'
import { Spin } from 'antd'
import loaderScript from './loader'

const RichText: React.FC<{ value?: any; key: string; onChange?: (...args: any) => void }> = (
  props
) => {
  const { key = 'default', value = '欢迎使用富文本编辑器', onChange = (...args: any) => {} } = props

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    loaderScript('https://cdn.bootcdn.net/ajax/libs/tinymce/5.4.1/tinymce.min.js', (err) => {
      console.log(err, window.tinymce)
      if (err || !window.tinymce) {
        return
      }

      setLoading(false)

      window.tinymce.init({
        selector: `#${key}-richtext-editor`,
        height: 500,
        menubar: true,
        toolbar: `undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help`,
        init_instance_callback: (editor: any) => {
          console.log('init')
          if (value) {
            editor.setContent(value)
          }

          editor.on('NodeChange Change KeyUp SetContent', () => {
            const content = editor.getContent()
            onChange(content)
          })
        },
      })
    })
    return () => {
      try {
        const tinymce = window.tinymce.get(`${key}-richtext-editor`)
        console.log(tinymce)
        tinymce?.destroy()
      } catch (e) {
        // ignore error
      }
    }
  }, [])

  return (
    <>
      {loading && <Spin />}
      <div id={`${key}-richtext-editor`} />
    </>
  )
}

export default RichText
