import { useParams } from 'umi'
import React, { useRef, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { getWebhooks, deleteWebhook } from '@/services/webhook'
import { Typography, Button, Modal, Space, Tag, Tabs, Popover, message, Tooltip } from 'antd'
import { WebhookModal } from './WebhookModal'

const { TabPane } = Tabs

interface Webhook {
  _id: string
  name: string
  url: string
  method: string
  event: string[]
  collections: (Schema | '*')[]
  headers: { key: string; value: string }[]
}

const EventMap = {
  create: '创建内容',
  delete: '删除内容',
  update: '更新内容',
  // 兼容 v1
  updateMany: '更新内容[批量]',
  deleteMany: '删除内容[批量]',
}

const WebhookColumns: ProColumns<Webhook>[] = [
  {
    title: 'Webhook 名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '触发路径',
    dataIndex: 'url',
    render: (_, row) => (
      <Tooltip title={row.url}>
        <Typography.Text>{row.url}</Typography.Text>
      </Tooltip>
    ),
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

const columns: ProColumns<Webhook>[] = WebhookColumns.map((item) => ({
  ...item,
  align: 'center',
}))

export default (): React.ReactNode => {
  const { projectId } = useParams<any>()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook>()
  const [webhookAction, setWebhookAction] = useState<'create' | 'edit'>('create')

  const tableRef = useRef<{
    reload: (resetPageIndex?: boolean) => void
    reloadAndRest: () => void
    fetchMore: () => void
    reset: () => void
    clearSelected: () => void
  }>()

  // 获取 webhooks
  const tableRequest = async (
    params: { pageSize: number; current: number; [key: string]: any },
    sort: {
      [key: string]: 'ascend' | 'descend' | null
    },
    filter: {
      [key: string]: React.ReactText[]
    }
  ) => {
    const { current, pageSize } = params

    try {
      const { data = [], total } = await getWebhooks(projectId, {
        sort,
        filter,
        pageSize,
        page: current,
      })

      return {
        data,
        total,
        success: true,
      }
    } catch (error) {
      console.log(error)
      return {
        data: [],
        total: 0,
        success: true,
      }
    }
  }

  return (
    <PageContainer
      className="page-container"
      content="Webhook 可以用于在内容管理员修改内容数据后，自动回调外部系统，比如自动构建静态网站、发送通知等"
    >
      <Tabs>
        <TabPane tab="Webhooks" key="webhooks">
          <ProTable
            rowKey="_id"
            search={false}
            defaultData={[]}
            actionRef={tableRef}
            dateFormatter="string"
            scroll={{ x: 1200 }}
            request={tableRequest}
            pagination={{
              showSizeChanger: true,
            }}
            columns={[
              ...columns,
              {
                title: '操作',
                width: 200,
                align: 'center',
                fixed: 'right',
                valueType: 'option',
                render: (_: any, row: any): React.ReactNode => [
                  <Button
                    size="small"
                    type="primary"
                    key="edit"
                    onClick={() => {
                      setWebhookAction('edit')
                      setSelectedWebhook(row)
                      setModalVisible(true)
                    }}
                  >
                    编辑
                  </Button>,
                  <Button
                    danger
                    size="small"
                    type="primary"
                    key="delete"
                    onClick={() => {
                      const modal = Modal.confirm({
                        centered: true,
                        title: '确认删除此 Webhook？',
                        onCancel: () => {
                          modal.destroy()
                        },
                        onOk: async () => {
                          await deleteWebhook(projectId, {
                            filter: {
                              _id: row._id,
                            },
                          })
                          message.success('删除 Webhook 成功')
                          tableRef?.current?.reloadAndRest()
                        },
                      })
                    }}
                  >
                    删除
                  </Button>,
                ],
              },
            ]}
            toolBarRender={() => [
              <Button
                type="primary"
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  setWebhookAction('create')
                  setSelectedWebhook(undefined)
                  setModalVisible(true)
                }}
              >
                新建
              </Button>,
            ]}
          />
        </TabPane>
        {/* <TabPane tab="执行日志" key="log">
          开发中
        </TabPane> */}
      </Tabs>

      <WebhookModal
        visible={modalVisible}
        action={webhookAction}
        selectedWebhook={selectedWebhook}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false)
          tableRef?.current?.reloadAndRest()
        }}
      />
    </PageContainer>
  )
}
