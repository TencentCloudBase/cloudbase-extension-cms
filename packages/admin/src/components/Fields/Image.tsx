import React, { useEffect, useState } from 'react'
import { message, Space, Spin, Empty, Image, Carousel, Button, Modal } from 'antd'
import { batchGetTempFileURL, isFileId } from '@/utils'
import emptyImg from '@/assets/empty.svg'
import { FileAction } from './FileAction'

const DefaultHeight = '60px'
const DefaultWidth = '200px'

const ImageContainerStyle = {
  // 居中
  margin: 'auto',
  overflow: 'hidden',
}

/**
 * 图片渲染组件，懒加载 + 轮播图
 */
export const ImageRender: React.FC<{ urls: string | string[] }> = ({ urls }) => {
  if (!urls?.length) {
    return <Empty image={emptyImg} imageStyle={{ height: '60px' }} description="未设定图片" />
  }

  // 轮播图
  if (Array.isArray(urls)) {
    return <ICloudImage fileUris={urls} />
  }

  // 单个图片
  const fileUri = urls as string
  if (!isFileId(fileUri)) {
    return (
      <Image
        src={fileUri}
        width={DefaultWidth}
        height={DefaultHeight}
        style={ImageContainerStyle}
      />
    )
  }

  return <ICloudImage fileUris={[urls]} />
}

/**
 * 云存储图片加载渲染组件
 */
const ICloudImage: React.FC<{ fileUris: string[] }> = ({ fileUris }) => {
  const [loading, setLoading] = useState(true)
  const [urls, setImgUrls] = useState<string[]>([])

  useEffect(() => {
    if (!fileUris?.length) return

    // 可能存在 fileId 和 http 混合的情况
    const fileIds = fileUris.filter((fileUri) => isFileId(fileUri))

    // 获取临时访问链接
    batchGetTempFileURL(fileIds)
      .then((results) => {
        // 拼接结果和 http 链接
        const imgUrls = fileUris.map((fileUri: string) => {
          let fileUrl: string = fileUri
          if (isFileId(fileUri)) {
            // eslint-disable-next-line
            const ret = results.find((_) => _.fileID === fileUri)
            fileUrl = ret?.tempFileURL || ''
          }

          return fileUrl
        })
        setImgUrls(imgUrls)
      })
      .catch((e) => {
        console.log(e)
        message.error(`获取图片链接失败 ${e.message}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return loading ? <Spin /> : <MultipleImage urls={urls} fileUris={fileUris} />
}

// 多图片展示展示
const MultipleImage: React.FC<{ urls: string[]; fileUris?: string[] }> = ({ urls, fileUris }) => {
  const [visible, setVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  if (urls?.length === 1) {
    return (
      <Space direction="vertical">
        <Image
          src={urls?.[0]}
          width={DefaultWidth}
          height={DefaultHeight}
          style={ImageContainerStyle}
        />
        {fileUris?.length && <FileAction type="image" fileUri={fileUris[currentSlide]} />}
      </Space>
    )
  }

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Image
          src={urls?.[0]}
          width={DefaultWidth}
          height={DefaultHeight}
          style={ImageContainerStyle}
        />
        <Button size="small" type="link" onClick={() => setVisible(true)}>
          查看更多
        </Button>
      </Space>
      <Modal
        title="图片"
        visible={visible}
        footer={null}
        width={700}
        onCancel={() => setVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Carousel
            dots={{
              className: 'carousel-dots',
            }}
            afterChange={(current) => {
              setCurrentSlide(current)
            }}
          >
            {urls.map((url, index) => (
              <Image
                key={index}
                src={url}
                width="100%"
                className="modal-image"
                style={ImageContainerStyle}
              />
            ))}
          </Carousel>
          {fileUris?.length && <FileAction type="image" fileUri={fileUris[currentSlide]} />}
        </Space>
      </Modal>
    </>
  )
}
