import React from 'react'
import { Space, Tag, Tooltip, Typography } from 'antd'
import { ProColumns } from '@ant-design/pro-table'
import { formatDisplayTimeByType } from '@/utils'
import { IConnectRender } from './Connect'

const { Text } = Typography

export const ActivityField: any = {
  displayName: '活动',
  description: '关联的活动',
  connectField: 'activityName',
  connectResource: 'b45a21d55ff939720430e24e0f94cb12',
  id: 'o91ouff816sbu0owdjqbcluira1enlqs',
  isRequired: true,
  name: 'activityId',
  order: 2,
  type: 'Connect',
}

export const taskColumns: ProColumns[] = [
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
          {text || '-'}
        </Text>
      </Tooltip>
    ),
  },
  {
    title: '关联活动',
    width: 300,
    align: 'center',
    dataIndex: 'activityId',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => (
      <IConnectRender value={record.activityId} field={ActivityField} />
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
        return '-'
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
        <Tooltip title={phoneNumberList.join(',')}>
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
        uploaded: '号码包已处理',
        created: '创建任务成功',
        create_fail: '创建任务失败',
        send_success: '发送成功',
        send_fail: '发送失败',
      }

      const status = record.status

      const StatusText = (
        <Text type={status === 'send_fail' ? 'danger' : 'success'}>{statusMap[status]}</Text>
      )

      if (status !== 'send_fail') {
        return StatusText
      }

      let errorInfo = record.error

      if (errorInfo.includes('-601027')) {
        errorInfo = '无效的环境'
      } else if (errorInfo.includes('-601028')) {
        errorInfo = '该环境没有开通静态网站'
      } else if (errorInfo.includes('-601029')) {
        errorInfo = '信息长度过长'
      } else if (errorInfo.includes('-601030')) {
        errorInfo = '信息含有违法违规内容'
      } else if (errorInfo.includes('-601031')) {
        errorInfo = '无效的 Path'
      } else if (errorInfo.includes('-601032')) {
        errorInfo = '小程序昵称不能为空'
      } else if (errorInfo.includes('-601033')) {
        errorInfo = '仅支持非个人主体小程序'
      } else if (errorInfo.includes('-1')) {
        errorInfo = '系统繁忙，此时请开发者稍候再试'
      }

      // 显示错误信息
      return <Tooltip title={errorInfo}>{StatusText}</Tooltip>
    },
  },
  {
    title: '号码总量',
    width: 100,
    align: 'center',
    dataIndex: 'total',
  },
  {
    title: '创建者',
    width: 200,
    align: 'center',
    sorter: true,
    filters: true,
    dataIndex: 'createdUser',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      // 显示错误信息
      return <Text>{record?.createdUser ? record.createdUser.username : '-'}</Text>
    },
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

/**
 * 发送结果列
 */
export const taskResultColumns: ProColumns[] = [
  {
    title: '手机号码',
    width: 200,
    align: 'center',
    dataIndex: 'Mobile',
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
    title: '短信内容',
    width: 200,
    align: 'center',
    dataIndex: 'Content',
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
    title: '短信长度',
    width: 100,
    align: 'center',
    dataIndex: 'ContentSize',
  },
  {
    title: '计费条数',
    width: 100,
    align: 'center',
    dataIndex: 'Fee',
  },
  {
    title: '创建时间',
    width: 200,
    align: 'center',
    dataIndex: 'CreateTime',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      return <Text>{record.CreateTime || '-'}</Text>
    },
  },
  {
    title: '用户接受时间',
    width: 200,
    align: 'center',
    dataIndex: 'ReceivedTime',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      return <Text>{record.ReceivedTime || '-'}</Text>
    },
  },
  {
    title: '发送状态',
    width: 200,
    align: 'center',
    dataIndex: 'Status',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      const statusMap = {
        sent: '发送成功',
        sending: '发送中',
        error: '发送失败',
      }

      const status = record.Status

      return <Text type={status === 'error' ? 'danger' : 'success'}>{statusMap[status]}</Text>
    },
  },
  {
    title: '备注',
    width: 200,
    align: 'center',
    dataIndex: 'Remarks',
  },
]
