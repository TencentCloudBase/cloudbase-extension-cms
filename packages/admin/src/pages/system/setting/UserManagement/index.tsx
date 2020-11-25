import { useRequest } from 'umi'
import { useSetState } from 'react-use'
import React, { useState } from 'react'
import ProList from '@ant-design/pro-list'
import { Skeleton, Button, Tag, Typography, Modal } from 'antd'
import { getUsers, deleteUser } from '@/services/user'
import { PlusOutlined } from '@ant-design/icons'
import { getUserRoles } from '@/services/role'
import CreateUserWithUsername from './CreateUserWithUsername'

export default (): React.ReactElement => {
  const [reload, setReload] = useState(0)
  const [actionState, setActionState] = useSetState<{
    visible: boolean
    action: 'create' | 'edit'
    selectedUser: any
  }>({
    action: 'edit',
    visible: false,
    selectedUser: {},
  })

  const { data, loading } = useRequest(() => getUsers(), {
    refreshDeps: [reload],
  })

  const { data: roles = [], loading: roleLoading } = useRequest(() => getUserRoles(), {
    refreshDeps: [reload],
  })

  if (loading || roleLoading) {
    return <Skeleton active />
  }

  const CreateUserModal = CreateUserWithUsername

  return (
    <>
      <ProList<any>
        toolBarRender={() => {
          return [
            <Button
              key="new"
              type="primary"
              onClick={() => {
                setActionState({
                  action: 'create',
                  selectedUser: undefined,
                  visible: true,
                })
              }}
            >
              <PlusOutlined /> 新建
            </Button>,
          ]
        }}
        rowKey="id"
        dataSource={data}
        metas={{
          title: {
            render: (dom, item) => <Typography.Title level={4}>{item.username}</Typography.Title>,
          },
          actions: {
            render: (dom, item) => [
              <Button
                size="small"
                key="edit"
                type="primary"
                onClick={() => {
                  setActionState({
                    action: 'edit',
                    selectedUser: item,
                    visible: true,
                  })
                }}
              >
                编辑
              </Button>,
              <Button
                danger
                size="small"
                key="delete"
                type="primary"
                disabled={item?.root}
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
          },
          description: {
            render: (dom, item) => (
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
          },
        }}
      />

      <CreateUserModal
        state={actionState}
        onClose={() => setActionState({ visible: false })}
        onSuccess={() => {
          setActionState({
            visible: false,
          })
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
    roleName: '内容管理员',
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
