import React, { useEffect, useState } from 'react'
import { Button, Input, Upload, message, Space, Progress, Spin, Empty } from 'antd'
import { copyToClipboard, downloadFile, getTempFileURL, uploadFile } from '@/utils'
import { CopyTwoTone, FileUnknownTwoTone, InboxOutlined } from '@ant-design/icons'

const { Dragger } = Upload

/**
 * 文件字段展示
 */
export const IFileRender: React.FC<{ src: string }> = ({ src }) => {
  if (!src) {
    return <span>空</span>
  }

  if (!/^cloud:\/\/\S+/.test(src)) {
    return (
      <>
        <div style={{ marginBottom: '10px' }}>
          <FileUnknownTwoTone style={{ fontSize: '32px' }} />
        </div>
        <Button
          size="small"
          onClick={() => {
            copyToClipboard(src)
              .then(() => {
                message.success('复制到剪切板成功')
              })
              .catch(() => {
                message.error('复制到剪切板成功')
              })
          }}
        >
          访问链接
          <CopyTwoTone />
        </Button>
      </>
    )
  }

  const [loading, setLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  return (
    <Space direction="vertical">
      <div style={{ marginBottom: '10px' }}>
        <FileUnknownTwoTone style={{ fontSize: '32px' }} />
      </div>
      <Space>
        <Button
          size="small"
          loading={downloadLoading}
          onClick={() => {
            setDownloadLoading(true)
            downloadFile(src).finally(() => {
              setDownloadLoading(false)
            })
          }}
        >
          下载文件
        </Button>
        <Button
          size="small"
          loading={loading}
          onClick={() => {
            setLoading(true)
            getTempFileURL(src)
              .then((url) => {
                copyToClipboard(url)
                  .then(() => {
                    message.success('复制到剪切板成功')
                  })
                  .catch(() => {
                    message.error('复制到剪切板成功')
                  })
              })
              .catch((e) => {
                console.log(e)
                console.log(e.message)
                message.error(`获取图片链接失败 ${e.message}`)
              })
              .finally(() => {
                setLoading(false)
              })
          }}
        >
          访问链接
          <CopyTwoTone />
        </Button>
      </Space>
    </Space>
  )
}

/**
 * 文件、图片上传
 */
export const IUploader: React.FC<{
  type?: 'file' | 'image'
  value?: string
  onChange?: (v: string) => void
}> = (props) => {
  let { value: fileUrl, type, onChange = () => {} } = props

  if (fileUrl && !/^cloud:\/\/\S+/.test(fileUrl)) {
    return (
      <>
        <Input type="url" value={fileUrl} onChange={(e) => onChange(e.target.value)} />
        {type === 'image' && <img style={{ height: '120px', marginTop: '10px' }} src={fileUrl} />}
      </>
    )
  }

  const [fileList, setFileList] = useState<any[]>()
  const [percent, setPercent] = useState(0)
  const [uploading, setUploading] = useState(false)

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
            name: `已上传${type === 'file' ? '文件' : '图片'}`,
            status: 'done',
          },
        ])
      })
      .catch((e) => {
        message.error(`加载图片失败 ${e.message}`)
      })
  }, [fileUrl])

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
            setFileList([
              {
                uid: fileUrl,
                name: file.name,
                status: 'done',
              },
            ])
            message.success(`上传${type === 'file' ? '文件' : '图片'}成功`)
          })
          return false
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽{type === 'file' ? '文件' : '图片'}上传</p>
      </Dragger>
      {uploading && <Progress style={{ paddingTop: '10px' }} percent={percent} />}
    </>
  )
}

/**
 * 图片懒加载
 */
export const ILazyImage: React.FC<{ src: string }> = ({ src }) => {
  if (!src) {
    return <Empty image="/img/empty.svg" imageStyle={{ height: '60px' }} description="未设定图片" />
  }

  if (!/^cloud:\/\/\S+/.test(src)) {
    return <img style={{ height: '120px', maxWidth: '200px' }} src={src} />
  }

  const [imgUrl, setImgUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTempFileURL(src)
      .then((url) => {
        console.log(url)
        setLoading(false)
        setImgUrl(url)
      })
      .catch((e) => {
        console.log(e)
        console.log(e.message)
        message.error(`获取图片链接失败 ${e.message}`)
        setLoading(false)
      })
  }, [])

  return loading ? (
    <Spin />
  ) : (
    <Space direction="vertical">
      <img style={{ height: '120px', maxWidth: '200px' }} src={imgUrl} />
      {imgUrl && (
        <Space>
          <Button
            size="small"
            onClick={() => {
              downloadFile(src)
            }}
          >
            下载图片
          </Button>
          <Button
            size="small"
            onClick={() => {
              getTempFileURL(src)
                .then((url) => {
                  copyToClipboard(url)
                    .then(() => {
                      message.success('复制到剪切板成功')
                    })
                    .catch(() => {
                      message.error('复制到剪切板成功')
                    })
                })
                .catch((e) => {
                  console.log(e)
                  console.log(e.message)
                  message.error(`获取图片链接失败 ${e.message}`)
                })
            }}
          >
            访问链接
            <CopyTwoTone />
          </Button>
        </Space>
      )}
    </Space>
  )
}
