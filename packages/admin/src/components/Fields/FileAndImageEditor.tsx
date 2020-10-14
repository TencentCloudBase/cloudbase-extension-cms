import React, { useEffect, useState } from 'react'
import { Button, Input, Upload, message, Form, Progress } from 'antd'
import { batchGetTempFileURL, getTempFileURL, uploadFile } from '@/utils'
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
  let { value: cloudIds, type, field, onChange = () => {} } = props
  const { isMultiple, name } = field

  // 数组模式
  if (isMultiple || Array.isArray(cloudIds)) {
    return (
      <IMultipleEditor
        type={type}
        value={cloudIds as string[]}
        fieldName={name}
        onChange={onChange}
      />
    )
  }

  // 单文件
  const fileUrl: string = cloudIds as string
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
  let { value: cloudIds = [], type, fieldName, onChange = () => {} } = props

  // 转为数组
  if (!Array.isArray(cloudIds) && typeof cloudIds === 'string') {
    cloudIds = [cloudIds]
  }

  // 存在非 CloudId 的链接
  const notCloudLink = cloudIds.some((cloudId) => cloudId && !/^cloud:\/\/\S+/.test(cloudId))
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

  return <IMultipleUploader type={type} cloudIds={cloudIds} onChange={onChange} />
}

/**
 * 多文件、图片上传
 */
const IMultipleUploader: React.FC<{
  type: 'file' | 'image'
  cloudIds: string[]
  onChange: (v: string[]) => void
}> = ({ type, cloudIds, onChange }) => {
  const [percent, setPercent] = useState(0)
  const [fileList, setFileList] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const tipText = type === 'file' ? '文件' : '图片'

  // 加载图片预览
  useEffect(() => {
    if (!cloudIds?.length) {
      return
    }

    if (type === 'file') {
      const fileList = cloudIds.map((cloudId: string) => {
        let fileName = cloudId?.split('/').pop() || ''
        return {
          url: cloudId,
          uid: cloudId,
          name: fileName,
          status: 'done',
        }
      })
      setFileList(fileList)
      return
    }

    // 当全部 cloudId 已经转换成临时访问链接时，不重新获取
    if (cloudIds.length <= fileList.length) {
      const isGotAllUrls = cloudIds.every((cloudId) =>
        fileList.find((file) => file.uid === cloudId && file.url !== file.uid)
      )
      if (isGotAllUrls) {
        return
      }
    }

    // 获取临时访问链接
    batchGetTempFileURL(cloudIds)
      .then((results) => {
        console.log(results)
        const fileList = results.map(({ tempFileURL, fileID }) => ({
          url: tempFileURL,
          uid: fileID,
          name: `已上传${tipText}`,
          status: 'done',
        }))
        setFileList(fileList)
      })
      .catch((e) => {
        message.error(`加载图片失败 ${e.message}`)
      })
  }, [cloudIds])

  return (
    <>
      <Dragger
        fileList={fileList}
        listType={type === 'image' ? 'picture' : 'text'}
        onRemove={(file) => {
          const newFileList = fileList.filter((_) => _.uid !== file.uid)
          const urls = newFileList.map((file) => file.uid)
          onChange(urls)
          setFileList(newFileList)
        }}
        beforeUpload={(file) => {
          setUploading(true)
          setPercent(0)
          // 上传文件
          uploadFile(file, (percent) => {
            setPercent(percent)
          }).then((cloudId) => {
            onChange([...cloudIds, cloudId])
            // 添加图片
            setFileList([
              ...fileList,
              {
                uid: cloudId,
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
