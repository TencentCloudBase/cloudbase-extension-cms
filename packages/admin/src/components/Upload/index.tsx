import { Upload, UploadProps } from 'antd'
import React, { useEffect } from 'react'
import { useSetState } from 'react-use'
import { InboxOutlined } from '@ant-design/icons'
import { fileIdToUrl, getFileNameFromUrl, uploadFile } from '@/utils'

const { Dragger } = Upload

export interface IAppProps {
  /**
   * 文件列表
   */
  value?: string[]

  /**
   * 上传提示文字
   */
  uploadTip?: React.ReactNode

  /**
   * 上传文件返回的链接类型
   */
  resourceLinkType?: 'fileId' | 'https'

  /**
   * 文件路径模版
   */
  filePathTemplate?: string

  /**
   * 文件上传存储类型，静态网站托管或云存储
   */
  uploadType?: 'hosting' | 'storage'

  /**
   * onChange 回调
   */
  onChange?: (uris: string[]) => void
}

export function DraggerUpload({
  value,
  onChange,
  uploadTip,
  uploadType,
  filePathTemplate,
  resourceLinkType = 'fileId',
  ...uploadProps
}: IAppProps & UploadProps) {
  const [{ fileList }, setState] = useSetState<{
    fileList: any[]
  }>({
    fileList: [],
  })

  // 首次加载时，初始化 fileList
  // 不能根据 value 的变化更改 fileList，会影响上传文件的展示
  useEffect(() => {
    const fileList: any[] =
      value?.map((url: string, index: number) => ({
        url,
        status: 'done',
        response: url,
        uid: String(index),
        name: getFileNameFromUrl(url),
      })) || []

    setState({
      fileList: fileList || [],
    })
  }, [])

  return (
    <Dragger
      multiple
      fileList={fileList}
      onRemove={(file) => {
        const newFileList: any = fileList.filter((_) => _.uid !== file.uid)
        const urls = newFileList.map((file: any) => file.url || file.response)

        onChange?.(urls)
        setState({
          fileList: newFileList,
        })
      }}
      onChange={({ fileList }) => {
        // 文件改变
        const newFileList = fileList.map((file) => {
          // 上传完成
          if (file.response) {
            file.url = file.response
          }
          return file
        })

        const fileUriList = newFileList
          .filter((_) => _.response || _.status === 'done')
          .map((_) => _.response || _.url)

        onChange?.(fileUriList)
        setState({ fileList: newFileList })
      }}
      customRequest={(options) => {
        const { file, onError, onProgress, onSuccess } = options

        // 上传文件
        uploadFile({
          uploadType,
          filePathTemplate,
          file: file as any,
          onProgress: (percent) => {
            onProgress?.({
              percent,
            } as any)
          },
        })
          .then((fileId: string) => {
            // 返回值
            const resourceLink = resourceLinkType === 'fileId' ? fileId : fileIdToUrl(fileId)
            onSuccess?.(resourceLink, file as any)
          })
          .catch((e) => {
            onError?.(e as any)
          })
      }}
      {...uploadProps}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{uploadTip ? uploadTip : '点击或拖拽文件、文件夹上传'}</p>
    </Dragger>
  )
}
