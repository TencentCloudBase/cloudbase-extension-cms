import React, { useEffect, useState } from 'react'
import { message, Space, Spin, Empty, Image, Carousel } from 'antd'
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
    return <MultiImageRender urls={urls} />
  }

  if (!/^cloud:\/\/\S+/.test(urls)) {
    return (
      <Image width={DefaultWidth} height={DefaultHeight} style={ImageContainerStyle} src={urls} />
    )
  }

  return <ICloudImage cloudIds={[urls]} />
}

/**
 * 多个图片，使用轮播图展示
 */
const MultiImageRender: React.FC<{ urls: string[] }> = ({ urls }) => {
  const hasNoCloudLink = urls.some((url) => url && !/^cloud:\/\/\S+/.test(url))

  // 存在非 CloudId 链接
  if (hasNoCloudLink) {
    return (
      <Carousel>
        {urls.map((url, index) => (
          <Image
            src={url}
            key={index}
            width={DefaultWidth}
            height={DefaultHeight}
            style={ImageContainerStyle}
          />
        ))}
      </Carousel>
    )
  }

  return <ICloudImage cloudIds={urls} />
}

/**
 * 云存储图片加载渲染组件
 */
const ICloudImage: React.FC<{ cloudIds: string[] }> = ({ cloudIds }) => {
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imgUrls, setImgUrls] = useState<string[]>([])

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

  return loading ? (
    <Spin />
  ) : (
    <Space direction="vertical" style={{ width: '100%' }}>
      {cloudIds?.length > 1 ? (
        <Carousel
          dots={{
            className: 'carousel-dots',
          }}
          afterChange={(current) => {
            setCurrentSlide(current)
          }}
        >
          {imgUrls.map((url, index) => (
            <Image
              key={index}
              src={url}
              width={DefaultWidth}
              height={DefaultHeight}
              style={ImageContainerStyle}
            />
          ))}
        </Carousel>
      ) : (
        <Image
          src={imgUrls?.[0]}
          width={DefaultWidth}
          height={DefaultHeight}
          style={ImageContainerStyle}
        />
      )}
      <FileAction type="image" cloudId={cloudIds[currentSlide]} />
    </Space>
  )
}
