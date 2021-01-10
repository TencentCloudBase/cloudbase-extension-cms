import React from 'react'
import { Space, Tag, Tooltip, Typography } from 'antd'
import { ProColumns } from '@ant-design/pro-table'
import { formatDisplayTimeByType } from '@/utils'

const { Text } = Typography

export const columns: ProColumns[] = [
  {
    title: '序号',
    width: 72,
    align: 'center',
    valueType: 'indexBorder',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      const { current, pageSize } = action
      const serial = Number(pageSize) * (Number(current) - 1) + index + 1
      return serial
    },
  },
  {
    title: '短信内容',
    width: 200,
    align: 'center',
    sorter: true,
    filters: true,
    dataIndex: 'content',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => (
      <Tooltip title={text}>
        <Text ellipsis style={{ width: '200px' }}>
          {text}
        </Text>
      </Tooltip>
    ),
  },
  {
    title: '页面路径',
    width: 200,
    align: 'center',
    sorter: true,
    filters: true,
    dataIndex: 'appPath',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => (
      <Tooltip title={text}>
        <Text ellipsis style={{ width: '200px' }}>
          {text}
        </Text>
      </Tooltip>
    ),
  },
  {
    title: '手机号码',
    width: 200,
    align: 'center',
    dataIndex: 'phoneNumberList',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      const { phoneNumberList } = record || {}
      if (!phoneNumberList?.length) {
        return text
      }

      if (phoneNumberList?.length < 5) {
        return (
          <Space direction="vertical">
            {phoneNumberList?.map((val: string, index: number) => (
              <Tag key={index}>{val}</Tag>
            ))}
          </Space>
        )
      }

      return (
        <Tooltip title={text}>
          <Text ellipsis style={{ width: '200px' }}>
            {phoneNumberList.join(',')}
          </Text>
        </Tooltip>
      )
    },
  },
  {
    title: '发送状态',
    width: 200,
    align: 'center',
    sorter: true,
    filters: true,
    dataIndex: 'status',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      const statusMap = {
        created: '创建任务成功',
        send_success: '发送成功',
        send_fail: '发送失败',
      }

      return <span>{statusMap[record.status]}</span>
    },
  },
  {
    title: '号码总量',
    width: 200,
    align: 'center',
    dataIndex: 'total',
  },
  {
    title: '创建时间',
    width: 200,
    align: 'center',
    sorter: true,
    filters: true,
    dataIndex: 'createTime',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      const date =
        typeof record.createTime === 'undefined'
          ? '-'
          : formatDisplayTimeByType(record.createTime, 'timestamp-ms', 'DateTime')
      return <Text>{date}</Text>
    },
  },
]
