import React from 'react'
import { message, Space, Tag, Tooltip, Typography } from 'antd'
import { IConnectRender, IFileRender, ImageRender } from '@/components/Fields'
import { calculateFieldWidth, copyToClipboard, formatDisplayTimeByType } from '@/utils'
import { IObjectRender } from './Object'
import { IMedia } from './Media'

const { Text } = Typography

/**
 * 根据类型获取展示字段组件
 */
export function getFieldRender(field: SchemaField) {
  const { name, type, displayName, copyable } = field
  const width = calculateFieldWidth(field)

  switch (type) {
    case 'String':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Tooltip title={text}>
          <Text
            ellipsis
            style={{ width }}
            onClick={() => {
              // 复制文本
              if (copyable) {
                copyToClipboard(record[name])
                message.success(`复制 ${name} 成功！`)
              }
            }}
          >
            {text}
          </Text>
        </Tooltip>
      )
    case 'Text':
    case 'MultiLineString':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Tooltip title={text}>
          <Text ellipsis style={{ width }}>
            {text}
          </Text>
        </Tooltip>
      )
    case 'Boolean':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        return <Text>{record[name] ? 'True' : 'False'}</Text>
      }
    case 'Number':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        const num = typeof record[name] === 'undefined' ? '-' : record[name]
        return <Text>{num} </Text>
      }
    case 'Url':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Link href={record[name]} target="_blank">
          {text}
        </Typography.Link>
      )
    case 'Email':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <Text>{text}</Text>
    case 'Tel':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <Text>{text}</Text>
    case 'Time':
    case 'Date':
    case 'DateTime':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        const date =
          typeof record[name] === 'undefined'
            ? '-'
            : formatDisplayTimeByType(record[name], field.dateFormatType, type)
        return <Text>{date}</Text>
      }
    case 'Image':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        return <ImageRender urls={record[name]} />
      }
    case 'File':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <IFileRender urls={record[name]} displayName={displayName} />
      )
    case 'Media':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <IMedia uri={record[name]} field={field} />
    case 'Array':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        if (!record[name]) {
          return text
        }

        return (
          <Space direction="vertical">
            {record[name]?.map((val: string, index: number) => (
              <Tag key={index}>{val}</Tag>
            ))}
          </Space>
        )
      }
    case 'Markdown':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Text ellipsis style={{ width }}>
          {text}
        </Text>
      )

    case 'RichText':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Text ellipsis style={{ width }}>
          {text}
        </Text>
      )

    case 'Connect':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <IConnectRender value={record[name]} field={field} />
      )
    case 'Object':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <IObjectRender value={record[name]} />
    default:
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => text
  }
}
