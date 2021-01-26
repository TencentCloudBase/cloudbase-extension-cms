import { copyToClipboard, downloadFile, fileIdToUrl, isFileId } from '@/utils'
import { CopyTwoTone } from '@ant-design/icons'
import { Button, message } from 'antd'
import React, { useState } from 'react'

/**
 * 文件/图片通用下载、复制访问链接组件
 * fileUri 可能是 fileId 或 https
 */
export const FileAction: React.FC<{
  index?: number
  fileUri: string
  type: 'file' | 'image'
}> = (props) => {
  const { index, fileUri, type } = props
  const tipText = type === 'file' ? '文件' : '图片'

  let [downloadLoading, setDownloadLoading] = useState<number | boolean>(false)
  downloadLoading = typeof index === 'undefined' ? downloadLoading : downloadLoading === index

  return (
    <div className="flex justify-center">
      {/* https 链接暂时不支持下载 */}
      {isFileId(fileUri) && (
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

            downloadFile(fileUri)
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
      )}
      <Button
        type="link"
        size="small"
        onClick={() => {
          if (!isFileId(fileUri)) {
            copyToClipboard(fileUri)
            return
          }

          const url = fileIdToUrl(fileUri)
          copyToClipboard(url)
          message.success('复制链接成功！')
        }}
      >
        访问链接
        <CopyTwoTone />
      </Button>
    </div>
  )
}
