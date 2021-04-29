import { ContentUtils } from 'braft-utils'
import React, { useEffect, useState } from 'react'
import { Upload, Progress, message, Modal, Input, Button } from 'antd'
import { InboxOutlined, FileImageTwoTone } from '@ant-design/icons'
import BraftEditor, { ExtendControlType } from 'braft-editor'
import { uploadFile } from '@/utils'
import 'braft-editor/dist/index.css'
import { useSetState } from 'react-use'

const { Dragger } = Upload

const RichText: React.FC<{ value?: any; id: number; onChange?: (...args: any) => void }> = (
  props
) => {
  const { id = 'default', value = '欢迎使用富文本编辑器', onChange = (...args: any) => {} } = props
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
        key={id}
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

interface IUploadState {
  fileList: any[]
  percent: number
  visible: boolean
  uploading: boolean
  inputUrl: string
}

export const CustomUploader: React.FC<{
  onChange?: (v: string) => void
}> = (props) => {
  let { onChange = () => {} } = props
  const [{ fileList, percent, visible, uploading, inputUrl }, setState] = useSetState<IUploadState>(
    {
      fileList: [],
      percent: 0,
      visible: false,
      uploading: false,
      inputUrl: '',
    }
  )

  return (
    <>
      <button type="button" data-title="媒体上传" className="control-item button">
        <FileImageTwoTone className="bfi-list" onClick={() => setState({ visible: true })} />
      </button>
      <Modal
        centered
        closable={true}
        visible={visible}
        footer={null}
        onCancel={() => setState({ visible: false })}
      >
        <p>输入链接插入图片</p>
        <div className="w-full flex">
          <Input
            className="flex-auto"
            value={inputUrl}
            placeholder="输入图片地址"
            onChange={(e) => setState({ inputUrl: e.target.value })}
          />
          &nbsp;
          <Button
            type="primary"
            onClick={() => {
              onChange(inputUrl)
              setState({ visible: false })
            }}
          >
            确认
          </Button>
        </div>
        <p className="mt-5">或拖拽上传插入图片</p>
        <Dragger
          fileList={fileList}
          listType="picture"
          beforeUpload={(file) => {
            setState({ uploading: true, percent: 0 })

            uploadFile({
              file,
              onProgress: (percent) => {
                setState({ percent })
              },
            })
              .then(({ url, fileId }) => {
                onChange(url)
                setState({
                  visible: false,
                  fileList: [
                    {
                      uid: fileId,
                      name: file.name,
                      status: 'done',
                    },
                  ],
                })
                message.success(`上传图片成功`)
              })
              .catch((e) => {
                console.log(e)
                message.error(`上传文件失败：${e.message}`)
              })

            return false
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
