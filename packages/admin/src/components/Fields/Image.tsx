import React, { useEffect, useState } from 'react'
import { message, Space, Spin, Empty, Image, Carousel } from 'antd'
import { getTempFileURL } from '@/utils'
import emptyImg from '@/assets/empty.svg'
import { FileAction } from './FileAction'

/**
 * 图片懒加载
 */
export const ILazyImage: React.FC<{ urls: string | string[]; isMultiple: boolean }> = ({
  urls,
  isMultiple,
}) => {
  if (!urls?.length) {
    return <Empty image={emptyImg} imageStyle={{ height: '60px' }} description="未设定图片" />
  }

  // 轮播图
  if ((isMultiple && Array.isArray(urls)) || Array.isArray(urls)) {
    return <IMultiLazyImage urls={urls} />
  }

  if (!/^cloud:\/\/\S+/.test(urls)) {
    return <Image style={{ maxHeight: '120px', maxWidth: '200px' }} src={urls} />
  }

  const [imgUrl, setImgUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTempFileURL(urls)
      .then((url) => {
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
      <Image style={{ maxHeight: '120px', maxWidth: '200px' }} src={imgUrl} />
      {imgUrl && <FileAction type="image" cloudId={urls} />}
    </Space>
  )
}

const IMultiLazyImage: React.FC<{ urls: string[] }> = ({ urls }) => {
  const hasNoCloudLink = urls.some((url) => url && !/^cloud:\/\/\S+/.test(url))

  if (hasNoCloudLink) {
    return (
      <Carousel>
        {urls.map((url, index) => (
          <Image src={url} key={index} style={{ maxHeight: '120px', maxWidth: '200px' }} />
        ))}
      </Carousel>
    )
  }

  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imgUrls, setImgUrls] = useState<string[]>([])

  useEffect(() => {
    const tasks = urls.map(async (url) => getTempFileURL(url))

    Promise.all(tasks)
      .then((resolvedUrls) => {
        setImgUrls(resolvedUrls)
        setLoading(false)
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
    <Space direction="vertical" style={{ width: '100%' }}>
      <Carousel
        autoplay
        afterChange={(current) => {
          setCurrentSlide(current)
        }}
      >
        {imgUrls.map((url, index) => (
          <Image key={index} src={url} style={{ maxHeight: '120px', maxWidth: '100%' }} />
        ))}
      </Carousel>
      <FileAction type="image" cloudId={urls[currentSlide]} />
    </Space>
  )
}
