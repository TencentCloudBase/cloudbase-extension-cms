import React, { useEffect, useState } from 'react'
import { Button, message, Space, Spin, Empty } from 'antd'
import { copyToClipboard, downloadFile, getTempFileURL } from '@/utils'
import { CopyTwoTone } from '@ant-design/icons'
import emptyImg from '@/assets/empty.svg'

/**
 * 图片懒加载
 */
export const ILazyImage: React.FC<{ src: string }> = ({ src }) => {
  if (!src) {
    return <Empty image={emptyImg} imageStyle={{ height: '60px' }} description="未设定图片" />
  }

  if (!/^cloud:\/\/\S+/.test(src)) {
    return <img style={{ maxHeight: '120px', maxWidth: '200px' }} src={src} />
  }

  const [imgUrl, setImgUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTempFileURL(src)
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
      <img style={{ maxHeight: '120px', maxWidth: '200px' }} src={imgUrl} />
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
