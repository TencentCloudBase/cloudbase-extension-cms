import React, { useEffect, useState } from 'react'
import { message, Space, Spin, Empty, Image, Carousel, Button, Modal } from 'antd'
import { batchGetTempFileURL } from '@/utils'
import emptyImg from '@/assets/empty.svg'
import { FileAction } from './FileAction'

const DefaultHeight = '60px'
const DefaultWidth = '200px'

const ImageContainerStyle = {
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
    const hasNoCloudLink = urls.some((url) => url && !/^cloud:\/\/\S+/.test(url))

    // 存在非 CloudId 链接
    if (hasNoCloudLink) {
      return <MultipleImage urls={urls} />
    }

    return <ICloudImage cloudIds={urls} />
  }

  if (!/^cloud:\/\/\S+/.test(urls)) {
    return (
      <Image width={DefaultWidth} height={DefaultHeight} style={ImageContainerStyle} src={urls} />
    )
  }

  return <ICloudImage cloudIds={[urls]} />
}

/**
 * 云存储图片加载渲染组件
 */
const ICloudImage: React.FC<{ cloudIds: string[] }> = ({ cloudIds }) => {
  const [loading, setLoading] = useState(true)
  const [urls, setImgUrls] = useState<string[]>([])

  useEffect(() => {
    if (!cloudIds?.length) return
    // 获取图片链接
    batchGetTempFileURL(cloudIds)
      .then((ret) => {
        const httpUrls = ret.map((_) => _.tempFileURL)
        setImgUrls(httpUrls)
      })
      .catch((e) => {
        console.log(e)
        console.log(e.message)
        message.error(`获取图片链接失败 ${e.message}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return loading ? <Spin /> : <MultipleImage urls={urls} cloudIds={cloudIds} />
}

// 多图片展示展示
const MultipleImage: React.FC<{ urls: string[]; cloudIds?: string[] }> = ({ urls, cloudIds }) => {
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
        {cloudIds?.length && <FileAction type="image" cloudId={cloudIds[currentSlide]} />}
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
          {cloudIds?.length && <FileAction type="image" cloudId={cloudIds[currentSlide]} />}
        </Space>
      </Modal>
    </>
  )
}
