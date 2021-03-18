import React from 'react'
import { useRequest } from 'umi'
import { Button, Space, message, Form, Input, Select } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { createWebhook, updateWebhook } from '@/services/webhook'
import { getSchemas } from '@/services/schema'
import { getProjectId } from '@/utils'

const EventMap = {
  create: '创建内容',
  delete: '删除内容',
  update: '更新内容',
}

export const WebhookForm: React.FC<{
  onClose: () => void
  onSuccess: () => void
  action: 'create' | 'edit'
  selectedWebhook?: Webhook
}> = ({ onClose, onSuccess, action, selectedWebhook }) => {
  const [form] = Form.useForm()
  const projectId = getProjectId()

  const actionText = action === 'create' ? '创建' : '更新'

  // 创建、更新 webhook
  const { run, loading } = useRequest(
    async (webhook: Webhook) => {
      if (action === 'create') {
        await createWebhook(projectId, {
          payload: {
            projectId,
            ...webhook,
          },
          filter: {
            projectId,
          },
        })
      }

      if (action === 'edit') {
        await updateWebhook(projectId, {
          filter: {
            _id: selectedWebhook?._id,
          },
          payload: {
            projectId,
            ...webhook,
          },
        })
      }

      onSuccess()
    },
    {
      manual: true,
      onError: () => message.error(`${actionText} Webhook 失败`),
      onSuccess: () => message.success(`${actionText} Webhook 成功`),
    }
  )

  // 加载数据库集合
  const { data: schemas = [], loading: schemaLoading } = useRequest<{ data: Schema[] }>(() =>
    getSchemas(projectId)
  )

  const eventOptions = Object.keys(EventMap).map((key) => ({
    value: key,
    label: EventMap[key],
  }))

  // 复制 webhook，collection 展开为 id 数组
  const initialWebhook = {
    ...selectedWebhook,
    type: selectedWebhook?.type || 'http',
    collections: selectedWebhook?.collections.map((_) => (_?._id ? _._id : _)),
  }

  return (
    <Form
      form={form}
      name="basic"
      layout="vertical"
      labelAlign="left"
      labelCol={{ span: 6 }}
      initialValues={action === 'edit' ? initialWebhook : { type: 'http' }}
      onFinish={(v: any = {}) => {
        v.collections = v.collections?.map((coll: string) => {
          if (coll === '*') {
            return '*'
          } else {
            return schemas.find((schema) => coll === schema._id)
          }
        })
        run(v)
      }}
    >
      <Form.Item
        label="Webhook 名称"
        name="name"
        rules={[{ required: true, message: '请输入 Webhook 名称！' }]}
      >
        <Input placeholder="Webhook 名称，如更新通知" />
      </Form.Item>

      <Form.Item label="Webhook 描述" name="description">
        <Input placeholder="Webhook 描述，如数据更新通知" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Webhook 类型"
        rules={[{ required: true, message: '请选择 Webhook 类型！' }]}
      >
        <Select>
          <Select.Option key="http" value="http">
            HTTP
          </Select.Option>
          <Select.Option key="function" value="function">
            云函数
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="监听内容"
        name="collections"
        rules={[{ required: true, message: '请选择监听内容！' }]}
      >
        <Select mode="multiple" loading={schemaLoading}>
          <Select.Option key="all" value="*">
            全部内容
          </Select.Option>
          {schemas?.map((schema: any) => (
            <Select.Option key={schema._id} value={schema._id}>
              {schema.displayName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="触发事件"
        name="event"
        rules={[{ required: true, message: '请选择触发类型！' }]}
      >
        <Select mode="multiple">
          <Select.Option value="*">全部</Select.Option>
          {eventOptions.map((event, index) => (
            <Select.Option value={event.value} key={index}>
              {event.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues?.type !== curValues?.type}>
        {() => {
          return form.getFieldValue('type') === 'function' ? (
            <Form.Item
              name="functionName"
              label="云函数名"
              rules={[{ required: true, message: '请输入 Webhook 触发云函数名称！' }]}
            >
              <Input placeholder="Webhook 触发云函数名称" />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                label="触发 URL"
                name="url"
                rules={[{ required: true, message: '请输入 Webhook 触发 URL！' }]}
              >
                <Input placeholder="Webhook 触发 URL，如 https://cloud.tencent.com" />
              </Form.Item>

              <Form.Item label="HTTP 方法" name="method">
                <Select>
                  <Select.Option value="POST">POST</Select.Option>
                  <Select.Option value="UPDATE">UPDATE</Select.Option>
                  <Select.Option value="DELETE">DELETE</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="HTTP Headers">
                <Form.List name="headers">
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields?.map((field, index) => {
                          return (
                            <Form.Item key={index}>
                              <Form.Item
                                noStyle
                                name={[field.name, 'key']}
                                validateTrigger={['onChange', 'onBlur']}
                              >
                                <Input placeholder="Header Key" style={{ width: '40%' }} />
                              </Form.Item>
                              <Form.Item
                                noStyle
                                name={[field.name, 'value']}
                                validateTrigger={['onChange', 'onBlur']}
                              >
                                <Input
                                  placeholder="Header Value"
                                  style={{ marginLeft: '5%', width: '40%' }}
                                />
                              </Form.Item>
                              <MinusCircleOutlined
                                className="dynamic-delete-button"
                                style={{ margin: '0 8px' }}
                                onClick={() => {
                                  remove(field.name)
                                }}
                              />
                            </Form.Item>
                          )
                        })}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => {
                              add()
                            }}
                            style={{ width: '60%' }}
                          >
                            <PlusOutlined /> 添加字段
                          </Button>
                        </Form.Item>
                      </div>
                    )
                  }}
                </Form.List>
              </Form.Item>
            </>
          )
        }}
      </Form.Item>

      <Form.Item>
        <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => onClose()}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {actionText}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
