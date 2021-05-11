import React from 'react'
import { Form, Space, Button, Input } from 'antd'

const RoleInfo: React.FC<{
  initialValues: any
  onConfrim: (...args: any) => void
}> = ({ onConfrim, initialValues }) => {
  return (
    <Form
      layout="vertical"
      labelAlign="left"
      initialValues={initialValues}
      labelCol={{ span: 6 }}
      onFinish={(v = {}) => {
        onConfrim(v)
      }}
    >
      <Form.Item
        label="角色名"
        name="roleName"
        rules={[
          {
            required: true,
            message: '请输入角色名称！',
          },
        ]}
      >
        <Input placeholder="角色名称" />
      </Form.Item>

      <Form.Item
        name="description"
        label="角色描述"
        rules={[{ required: true, message: '请输入角色描述！' }]}
      >
        <Input placeholder="描述此角色的信息" />
      </Form.Item>

      <Form.Item>
        <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button type="primary" htmlType="submit">
            下一步
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default RoleInfo
