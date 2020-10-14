import React, { useEffect, useState } from 'react'
import { Button, Input, Upload, message, Form, Progress } from 'antd'
import { getTempFileURL, uploadFile } from '@/utils'
import { PlusOutlined, InboxOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Dragger } = Upload

/**
 * 文件、图片编辑组件
 */
export const IFileAndImageEditor: React.FC<{
  field: SchemaFieldV2
  type: 'file' | 'image'
  value?: string | string[]
  onChange?: (v: string | string[]) => void
}> = (props) => {
  let { value: urls, type, field, onChange = () => {} } = props
  const { isMultiple, name } = field

  // 数组模式
  if (isMultiple || Array.isArray(urls)) {
    return (
      <IMultipleEditor type={type} value={urls as string[]} fieldName={name} onChange={onChange} />
    )
  }

  // 单文件
  const fileUrl: string = urls as string
  if (fileUrl && !/^cloud:\/\/\S+/.test(fileUrl)) {
    // 单链接
    return (
      <>
        <Input type="url" value={fileUrl} onChange={(e) => onChange(e.target.value)} />
        {type === 'image' && <img style={{ height: '120px', marginTop: '10px' }} src={fileUrl} />}
      </>
    )
  }

  return <ISingleFileUploader type={type} fileUrl={fileUrl} onChange={onChange} />
}

/**
 * 单文件、图片上传
 */
export const ISingleFileUploader: React.FC<{
  type: 'file' | 'image'
  fileUrl: string
  onChange: (v: string | string[]) => void
}> = ({ type, fileUrl, onChange }) => {
  const [percent, setPercent] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState<any[]>([])
  const tipText = type === 'file' ? '文件' : '图片'

  // 加载图片预览
  useEffect(() => {
    if (!fileUrl) {
      return
    }

    if (type === 'file') {
      let fileName = fileUrl?.split('/').pop() || ''
      setFileList([
        {
          url: fileUrl,
          uid: fileUrl,
          name: fileName,
          status: 'done',
        },
      ])
      return
    }

    getTempFileURL(fileUrl)
      .then((url: string) => {
        setFileList([
          {
            url,
            uid: fileUrl,
            name: `已上传${tipText}`,
            status: 'done',
          },
        ])
      })
      .catch((e) => {
        message.error(`加载图片失败 ${e.message}`)
      })
  }, [])

  return (
    <>
      <Dragger
        fileList={fileList}
        listType={type === 'image' ? 'picture' : 'text'}
        beforeUpload={(file) => {
          setUploading(true)
          setPercent(0)
          // 上传文件
          uploadFile(file, (percent) => {
            setPercent(percent)
          }).then((fileUrl) => {
            onChange(fileUrl)
            // 添加图片
            setFileList([
              {
                uid: fileUrl,
                name: file.name,
                status: 'done',
              },
            ])
            message.success(`上传${tipText}成功`)
          })
          return false
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽{tipText}上传</p>
      </Dragger>
      {uploading && <Progress style={{ paddingTop: '10px' }} percent={percent} />}
    </>
  )
}

/**
 * 多文件、图片编辑组件
 */
export const IMultipleEditor: React.FC<{
  type: 'file' | 'image'
  value: string[]
  fieldName: string
  onChange?: (v: string[]) => void
}> = (props) => {
  let { value: urls = [], type, fieldName, onChange = () => {} } = props

  // 转为数组
  if (!Array.isArray(urls) && typeof urls === 'string') {
    urls = [urls]
  }

  const notCloudLink = urls.some((url) => url && !/^cloud:\/\/\S+/.test(url))

  if (notCloudLink) {
    return (
      <Form.List name={fieldName}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields?.map((field, index) => {
                return (
                  <Form.Item key={index}>
                    <Form.Item {...field} noStyle validateTrigger={['onChange', 'onBlur']}>
                      <Input style={{ width: 'calc(100% - 50px)' }} />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ width: '50px' }}
                      onClick={() => {
                        remove(field.name)
                      }}
                    />
                  </Form.Item>
                )
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    add()
                  }}
                  style={{ width: 'calc(100% - 50px)' }}
                >
                  <PlusOutlined /> 添加链接
                </Button>
              </Form.Item>
            </div>
          )
        }}
      </Form.List>
    )
  }

  return <IMultipleUploader type={type} urls={urls} onChange={onChange} />
}

/**
 * 多文件、图片上传
 */
const IMultipleUploader: React.FC<{
  type: 'file' | 'image'
  urls: string[]
  onChange: (v: string[]) => void
}> = ({ type, urls, onChange }) => {
  const [percent, setPercent] = useState(0)
  const [fileList, setFileList] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const tipText = type === 'file' ? '文件' : '图片'

  // 加载图片预览
  useEffect(() => {
    if (!urls?.length) {
      return
    }

    if (type === 'file') {
      const fileList = urls.map((url: string) => {
        let fileName = url?.split('/').pop() || ''
        return {
          url,
          uid: url,
          name: fileName,
          status: 'done',
        }
      })
      setFileList(fileList)
      return
    }

    const tasks = urls.map(async (url) => getTempFileURL(url))
    Promise.all(tasks)
      .then((resolvedUrls) => {
        const fileList = resolvedUrls.map((url) => ({
          url,
          uid: url,
          name: `已上传${tipText}`,
          status: 'done',
        }))
        setFileList(fileList)
      })
      .catch((e) => {
        message.error(`加载图片失败 ${e.message}`)
      })
  }, [])

  return (
    <>
      <Dragger
        fileList={fileList}
        listType={type === 'image' ? 'picture' : 'text'}
        beforeUpload={(file) => {
          setUploading(true)
          setPercent(0)
          // 上传文件
          uploadFile(file, (percent) => {
            setPercent(percent)
          }).then((fileUrl) => {
            onChange([...urls, fileUrl])
            // 添加图片
            setFileList([
              ...fileList,
              {
                uid: fileUrl,
                name: file.name,
                status: 'done',
              },
            ])
            message.success(`上传${tipText}成功`)
          })
          return false
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽{tipText}上传</p>
      </Dragger>
      {uploading && <Progress style={{ paddingTop: '10px' }} percent={percent} />}
    </>
  )
}
