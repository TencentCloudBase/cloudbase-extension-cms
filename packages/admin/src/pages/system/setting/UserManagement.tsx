import React, { useState } from 'react'
import { useRequest } from 'umi'
import ProList from '@ant-design/pro-list'
import { Skeleton, Button, Tag, Space, Typography, message, Modal, Form, Input, Select } from 'antd'

import { getUsers, createUser, deleteUser, updateUser } from '@/services/user'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import { getUserRoles } from '@/services/role'

export default (): React.ReactElement => {
  const [reload, setReload] = useState(0)
  const [selectedUser, setSelectedUser] = useState()
  const [userAction, setUserAction] = useState<'create' | 'edit'>('create')
  const [modalVisible, setModalVisible] = useState(false)

  const { data, loading } = useRequest(() => getUsers(), {
    refreshDeps: [reload],
  })

  const { data: roles = [], loading: roleLoading } = useRequest(() => getUserRoles(), {
    refreshDeps: [reload],
  })

  if (loading || roleLoading) {
    return <Skeleton active />
  }

  return (
    <>
      <ProList<string>
        actions={[
          <Button key="new" size="small" type="primary" onClick={() => setModalVisible(true)}>
            新建
          </Button>,
        ]}
        rowKey="id"
        dataSource={data}
        renderItem={(item: any) => ({
          title: <Typography.Title level={4}>{item.username}</Typography.Title>,
          actions: [
            <Button
              size="small"
              key="edit"
              type="primary"
              onClick={() => {
                setUserAction('edit')
                console.log(item)
                setSelectedUser(item)
                setModalVisible(true)
              }}
            >
              编辑
            </Button>,
            <Button
              danger
              size="small"
              key="delete"
              type="primary"
              onClick={() => {
                Modal.confirm({
                  title: `确认删除用户 ${item.username} ？`,
                  onOk: async () => {
                    await deleteUser(item._id)
                    setReload(reload + 1)
                  },
                })
              }}
            >
              删除
            </Button>,
          ],
          description: (
            <div>
              {item.roles?.map((roleId: any, index: number) => {
                const role = roles?.find((_: any) => _._id === roleId)

                return (
                  <Tag key={index} color="#2575e6">
                    {role?.roleName}
                  </Tag>
                )
              })}
            </div>
          ),
        })}
      />
      <CreateUserModal
        visible={modalVisible}
        action={userAction}
        selectedUser={selectedUser}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false)
          setReload(reload + 1)
        }}
      />
    </>
  )
}

export const SystemUserRoles = [
  {
    _id: 'administrator',
    roleName: '系统管理员',
    description: '允许管理系统内所有用户及其权限、所有内容、所有系统设置等',
    polices: [
      {
        action: ['*'],
        effect: 'allow',
        resource: ['*'],
        service: ['*'],
      },
    ],
    type: 'system',
  },
  {
    _id: 'project:administrator',
    roleName: '项目管理员',
    description: '允许管理系统内的所有项目及项目内的资源',
    polices: [
      {
        action: ['*'],
        project: ['*'],
        effect: 'allow',
        service: ['*'],
        resource: ['*'],
      },
    ],
    type: 'system',
  },
  {
    _id: 'content:administrator',
    roleName: '系统内容管理员',
    description: '允许管理系统内的所有内容',
    polices: [
      {
        action: ['*'],
        project: ['*'],
        effect: 'allow',
        service: ['content'],
        resource: ['*'],
      },
    ],
    type: 'system',
  },
]

/**
 * 创建用户
 */
const CreateUserModal: React.FC<{
  visible: boolean
  action: 'create' | 'edit'
  selectedUser?: any
  onClose: () => void
  onSuccess: () => void
}> = ({ visible, onClose, onSuccess, action, selectedUser }) => {
  // 加载用户列表
  const { run, loading } = useRequest(
    async (data: any) => {
      if (action === 'create') {
        await createUser(data)
      }

      if (action === 'edit') {
        const diffData = Object.keys(selectedUser)
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

  const { data: userRoles = [] } = useRequest(() => getUserRoles())

  return (
    <Modal
      centered
      destroyOnClose
      width={800}
      footer={null}
      visible={visible}
      onOk={() => onClose()}
      onCancel={() => onClose()}
      title={action === 'create' ? '新建用户' : '编辑用户'}
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
          <Input placeholder="用户名" />
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
            placeholder="输入密码"
            visibilityToggle={action === 'create'}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          label="用户角色"
          name="roles"
          rules={[{ required: true, message: '请选择用户角色！' }]}
        >
          <Select mode="multiple">
            {userRoles?.map((role: any, index: any) => (
              <Select.Option key={index} value={role._id}>
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
