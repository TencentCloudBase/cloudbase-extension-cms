import { Upload, Progress, message, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import { InboxOutlined, FileImageTwoTone } from '@ant-design/icons'
import { ContentUtils } from 'braft-utils'
import BraftEditor, { ExtendControlType } from 'braft-editor'
import { uploadFile, getTempFileURL } from '@/utils'
import 'braft-editor/dist/index.css'

const { Dragger } = Upload

const RichText: React.FC<{ value?: any; key: string; onChange?: (...args: any) => void }> = (
  props
) => {
  const { key = 'default', value = '欢迎使用富文本编辑器', onChange = (...args: any) => {} } = props
  const [editorState, setEditorState] = useState<any>()

  useEffect(() => {
    const state = BraftEditor.createEditorState(value)
    setEditorState(state)
  }, [])

  const extendControls: ExtendControlType[] = [
    {
      key: 'antd-uploader',
      type: 'component',
      component: (
        <CustomUploader
          onChange={(url) => {
            const state = ContentUtils.insertMedias(editorState, [
              {
                type: 'IMAGE',
                url,
              },
            ])
            setEditorState(state)
          }}
        />
      ),
    },
  ]

  return (
    <div style={{ border: '1px solid #d1d1d1' }}>
      <BraftEditor
        key={key}
        value={editorState}
        onChange={(s) => {
          setEditorState(s)
          onChange(s.toHTML())
        }}
        excludeControls={['media']}
        extendControls={extendControls}
      />
    </div>
  )
}

export const CustomUploader: React.FC<{
  onChange?: (v: string) => void
}> = (props) => {
  let { onChange = () => {} } = props
  const [fileList, setFileList] = useState<any[]>()
  const [percent, setPercent] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [visible, setVisible] = useState(false)

  return (
    <>
      <button type="button" data-title="媒体上传" className="control-item button">
        <FileImageTwoTone className="bfi-list" onClick={() => setVisible(true)} />
      </button>
      <Modal closable={true} visible={visible} footer={null} onCancel={() => setVisible(false)}>
        <Dragger
          fileList={fileList}
          listType="picture"
          beforeUpload={async (file) => {
            setUploading(true)
            setPercent(0)
            // 上传文件
            let fileId
            try {
              fileId = await uploadFile(file, (percent) => {
                setPercent(percent)
              })
            } catch (error) {
              console.log(error)
              message.error(`上传文件失败：${error.message}`)
              return
            }
            const url = await getTempFileURL(fileId)

            onChange(url)
            setFileList([
              {
                uid: fileId,
                name: file.name,
                status: 'done',
              },
            ])
            message.success(`上传图片成功`)
            setVisible(false)
            return Promise.reject()
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片上传</p>
        </Dragger>
        {uploading && <Progress style={{ paddingTop: '10px' }} percent={percent} />}
      </Modal>
    </>
  )
}

export default RichText
