import { copyToClipboard, downloadFile, getTempFileURL } from '@/utils'
import { CopyTwoTone } from '@ant-design/icons'
import { Button, message } from 'antd'
import React, { useState } from 'react'

export const FileAction: React.FC<{
  index?: number
  cloudId: string
  type: 'file' | 'image'
}> = (props) => {
  const { index, cloudId, type } = props
  const tipText = type === 'file' ? '文件' : '图片'

  let [copyLoading, setCopyLoading] = useState<number | boolean>(false)
  let [downloadLoading, setDownloadLoading] = useState<number | boolean>(false)

  copyLoading = typeof index === 'undefined' ? copyLoading : copyLoading === index
  downloadLoading = typeof index === 'undefined' ? downloadLoading : downloadLoading === index

  return (
    <div>
      <Button
        type="link"
        size="small"
        loading={downloadLoading as boolean}
        onClick={() => {
          if (typeof index === 'undefined') {
            setDownloadLoading(true)
          } else {
            setDownloadLoading(index)
          }

          downloadFile(cloudId)
            .then(() => {
              message.success(`下载${tipText}成功`)
            })
            .catch((e) => {
              console.log(e)
              console.log(e.message)
              message.error(`下载${tipText}失败 ${e.message}`)
            })
            .finally(() => {
              setDownloadLoading(false)
            })
        }}
      >
        下载{tipText}
      </Button>
      <Button
        type="link"
        size="small"
        loading={copyLoading as boolean}
        onClick={() => {
          if (typeof index === 'undefined') {
            setCopyLoading(true)
          } else {
            setCopyLoading(index)
          }

          getTempFileURL(cloudId)
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
              message.error(`获取链接失败 ${e.message}`)
            })
            .finally(() => {
              setCopyLoading(false)
            })
        }}
      >
        访问链接
        <CopyTwoTone />
      </Button>
    </div>
  )
}
