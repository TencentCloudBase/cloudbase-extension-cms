import React from 'react'
import { Space, Typography, List, Tooltip } from 'antd'

import { PaperClipOutlined } from '@ant-design/icons'
import { FileAction } from './FileAction'

const { Text } = Typography

/**
 * 文件字段展示
 */
export const IFileRender: React.FC<{ urls: string | string[]; isMultiple: boolean }> = ({
  urls,
  isMultiple,
}) => {
  if (!urls?.length) {
    return <span>空</span>
  }

  // 文件数组
  if ((isMultiple && Array.isArray(urls)) || Array.isArray(urls)) {
    // 存在不是 cloudId 的链接
    const hasNoCloudLink = urls.some((url) => url && !/^cloud:\/\/\S+/.test(url))

    return (
      <List
        split={false}
        dataSource={urls}
        itemLayout="horizontal"
        renderItem={(item, index) => {
          const fileName = item?.split('/').pop() || ''
          return (
            <List.Item>
              <PaperClipOutlined style={{ fontSize: '16px' }} /> &nbsp;
              <Tooltip title={fileName}>
                <Text ellipsis style={{ width: '80%' }}>
                  {fileName}
                </Text>
              </Tooltip>
              {!hasNoCloudLink && <FileAction type="file" cloudId={item} index={index} />}
            </List.Item>
          )
        }}
      />
    )
  }

  // 单文件
  const fileUrl: string = urls as string
  const fileName = fileUrl?.split('/').pop() || ''

  if (!/^cloud:\/\/\S+/.test(fileUrl)) {
    return (
      <div>
        <PaperClipOutlined style={{ fontSize: '16px' }} />
        &nbsp;
        <Tooltip title={fileName}>
          <Text ellipsis style={{ width: '80%' }}>
            {fileName}
          </Text>
        </Tooltip>
      </div>
    )
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <PaperClipOutlined style={{ fontSize: '16px' }} />
        &nbsp;
        <Tooltip title={fileName}>
          <Text ellipsis style={{ width: '50%' }}>
            {fileName}
          </Text>
        </Tooltip>
      </div>
      <FileAction type="file" cloudId={fileUrl} />
    </Space>
  )
}
