import React from 'react'
import { Typography, List, Tooltip, Popover, Space } from 'antd'
import { PaperClipOutlined } from '@ant-design/icons'
import { isFileId, calculateFieldWidth } from '@/utils'
import { FileAction } from './FileAction'

const { Text } = Typography

let fileNameStyle = {
  width: '80%',
}

/**
 * 文件字段展示
 */
export const IFileRender: React.FC<{ urls: string | string[]; displayName: string }> = ({
  urls,
  displayName,
}) => {
  if (!urls?.length) {
    return <span>空</span>
  }

  const width = calculateFieldWidth({
    displayName,
    type: 'File',
  })

  fileNameStyle.width = `${width - 30}px`

  // 文件数组
  if (Array.isArray(urls)) {
    return (
      <List
        split={false}
        dataSource={urls}
        itemLayout="horizontal"
        renderItem={(item, index) => {
          const fileName = item?.split('/').pop() || ''
          return (
            <List.Item>
              <Space>
                <PaperClipOutlined style={{ fontSize: '16px' }} />
                <Popover content={<FileAction type="file" fileUri={item} index={index} />}>
                  <Text ellipsis style={fileNameStyle}>
                    {fileName}
                  </Text>
                </Popover>
              </Space>
            </List.Item>
          )
        }}
      />
    )
  }

  // 单文件
  const fileUrl: string = urls as string
  const fileName = fileUrl?.split('/').pop() || ''

  if (!isFileId(fileUrl)) {
    return (
      <Space>
        <PaperClipOutlined style={{ fontSize: '16px' }} />
        <Tooltip title={fileName}>
          <Text ellipsis style={fileNameStyle}>
            {fileName}
          </Text>
        </Tooltip>
      </Space>
    )
  }

  return (
    <Space>
      <PaperClipOutlined style={{ fontSize: '16px' }} />
      <Popover content={<FileAction type="file" fileUri={fileUrl} />}>
        <Text ellipsis style={fileNameStyle}>
          {fileName}
        </Text>
      </Popover>
    </Space>
  )
}
