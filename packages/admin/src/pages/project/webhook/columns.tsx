import React from 'react'
import { ProColumns } from '@ant-design/pro-table'
import { Popover, Space, Tag, Tooltip, Typography } from 'antd'

const EventMap = {
  create: '创建内容',
  delete: '删除内容',
  update: '更新内容',
  createOne: '创建内容',
  deleteOne: '删除内容',
  setOne: '更新内容',
  updateOne: '更新内容',
  // 兼容 v1
  updateMany: '更新内容[批量]',
  deleteMany: '删除内容[批量]',
}

export const WebhookColumns: ProColumns<Webhook>[] = [
  {
    title: 'Webhook 名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: 'Webhook 类型',
    dataIndex: 'type',
    width: 200,
    valueEnum: {
      http: 'HTTP',
      function: '云函数',
    },
  },
  {
    title: '触发类型',
    dataIndex: 'event',
    valueType: 'textarea',
    width: 150,
    render: (_, row) => {
      if (row.event.includes('*')) {
        return '全部'
      }

      return (
        <Popover
          title={null}
          trigger="hover"
          content={row.event
            .map((_) => EventMap[_])
            .map((_, index) => (
              <Tag key={index}>{_}</Tag>
            ))}
        >
          <div>
            <Tag>{row.event?.[0]}</Tag>
            {row.event?.length > 1 && '...'}
          </div>
        </Popover>
      )
    },
  },
  {
    title: '监听内容',
    dataIndex: 'collections',
    render: (_, row) => (
      <Space>
        {row.collections.map((_, index) => {
          if (_ === '*') {
            return <Typography.Text key={index}>全部</Typography.Text>
          } else {
            return <Typography.Text key={index}>{_ ? _.displayName : '空'}</Typography.Text>
          }
        })}
      </Space>
    ),
  },
  {
    title: '触发路径/函数名称',
    dataIndex: 'url',
    render: (_, row) => (
      <Tooltip title={row.url || row.functionName}>
        <Typography.Text>{row.url || row.functionName || '-'}</Typography.Text>
      </Tooltip>
    ),
  },
  {
    title: 'HTTP 方法',
    dataIndex: 'method',
    width: 100,
    valueEnum: {
      GET: 'GET',
      POST: 'POST',
      UPDATE: 'UPDATE',
      DELETE: 'DELETE',
      PATCH: 'PATCH',
    },
  },
]

export const WebhookLogColumns: ProColumns<Webhook & { action: string; result: string }>[] = [
  {
    title: 'Webhook 名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: 'Webhook 类型',
    dataIndex: 'type',
    width: 200,
    valueEnum: {
      http: 'HTTP',
      function: '云函数',
    },
  },
  {
    title: '触发事件',
    dataIndex: 'action',
    valueType: 'textarea',
    width: 150,
    render: (_, row) => {
      return <Tag>{EventMap[row.action]}</Tag>
    },
  },
  {
    title: '监听集合',
    width: 100,
    dataIndex: 'collections',
    render: (_, row) => (
      <Space>
        {row.collections.map((_, index) => {
          if (_ === '*') {
            return <Typography.Text key={index}>全部</Typography.Text>
          } else {
            return <Typography.Text key={index}>{_ ? _.displayName : '空'}</Typography.Text>
          }
        })}
      </Space>
    ),
  },
  {
    title: '触发路径/函数名称',
    dataIndex: 'url',
    width: 200,
    render: (_, row) => (
      <Tooltip title={row.url || row.functionName}>
        <Typography.Text>{row.url || row.functionName || '-'}</Typography.Text>
      </Tooltip>
    ),
  },
  {
    title: '执行状态',
    dataIndex: 'status',
    width: 100,
    valueEnum: {
      success: {
        text: '成功',
        status: 'Success',
      },
      error: {
        text: '异常',
        status: 'Error',
      },
    },
  },
  {
    title: '响应结果',
    dataIndex: 'result',
    width: 300,
    render: (_, row) => (
      <Tooltip title={row.result} placement="left">
        <Typography.Text copyable ellipsis style={{ maxWidth: '200px' }}>
          {row.result}
        </Typography.Text>
      </Tooltip>
    ),
  },
  {
    title: '执行时间',
    dataIndex: 'timestamp',
    valueType: 'dateTime',
    width: 200,
  },
  {
    title: '操作者',
    dataIndex: ['triggerUser', 'username'],
    width: 200,
  },
]
