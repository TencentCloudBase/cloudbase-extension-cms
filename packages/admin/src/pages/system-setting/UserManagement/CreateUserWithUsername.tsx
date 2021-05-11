import React from 'react'
import { useRequest } from 'umi'
import { Button, Space, message, Modal, Form, Input, Select } from 'antd'
import { createUser, updateUser } from '@/services/user'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import { getUserRoles } from '@/services/role'

export default ({
  onClose,
  onSuccess,
  state,
}: {
  state: {
    visible: boolean
    selectedUser?: any
    action: 'create' | 'edit'
  }
  onClose: () => void
  onSuccess: () => void
}) => {
  const { visible, action, selectedUser } = state
  // 加载用户列表
  const { run, loading } = useRequest(
    async (data: any) => {
      if (action === 'create') {
        await createUser(data)
      }

      if (action === 'edit') {
        const diffData = Object.keys(data)
          .filter((key) => selectedUser[key] !== data[key])
          .reduce(
            (ret, key) => ({
              ...ret,
              [key]: data[key],
            }),
            {}
          )

        await updateUser(selectedUser._id, diffData)
      }
      onSuccess()
    },
    {
      manual: true,
      onError: () => message.error(`${action === 'create' ? '添加' : '更新'}用户失败`),
      onSuccess: () => message.success(`${action === 'create' ? '添加' : '更新'}用户成功`),
    }
  )

  const { data: userRoles = [] } = useRequest(() => getUserRoles(1, 1000))

  return (
    <Modal
      centered
      destroyOnClose
      width={800}
      footer={null}
      visible={visible}
      onOk={() => onClose()}
      onCancel={() => onClose()}
      title={action === 'create' ? '添加用户' : '编辑用户'}
    >
      <Form
        layout="vertical"
        labelAlign="left"
        labelCol={{ span: 6 }}
        initialValues={selectedUser}
        onFinish={(v = {}) => {
          run(v)
        }}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            {
              required: true,
              pattern: /^[a-zA-Z0-9]+[a-zA-Z0-9_-]?[a-zA-Z0-9]+$/g,
              message: '用户名不符合规则',
            },
            {
              required: true,
              pattern: /\D+/g,
              message: '用户名不能是纯数字',
            },
          ]}
        >
          <Input placeholder="用户名，字母和数字的组合，不能为纯数字，长度范围是 1 ~ 32" />
        </Form.Item>
        <Form.Item
          label="用户密码"
          name="password"
          rules={[
            { required: action === 'create', min: 8, max: 32, message: '密码长度必需大于 8 位' },
            {
              pattern: /\D+/,
              message: '密码不能由纯数字或字母组成',
            },
            {
              pattern: /[^a-zA-Z]/,
              message: '密码不能由纯数字或字母组成',
            },
          ]}
        >
          <Input.Password
            placeholder="密码长度必需大于 8 位，不能由纯数字或纯字母组成"
            visibilityToggle={action === 'create'}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          label="用户角色"
          name="roles"
          rules={[{ required: true, message: '请选择用户角色！' }]}
        >
          {/* 管理员角色不能修改 */}
          <Select
            showSearch
            mode="multiple"
            disabled={selectedUser?.root}
            optionLabelProp="label"
            filterOption={(input, option) => {
              return (option?.label as string)?.includes(input)
            }}
          >
            {userRoles?.map((role: any, index: any) => (
              <Select.Option key={index} value={role._id} label={role.roleName}>
                <h4>{role.roleName}</h4>
                <div>{role.description}</div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => onClose()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {`${action === 'create' ? '新建' : '更新'}`}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
