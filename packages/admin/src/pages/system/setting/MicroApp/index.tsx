import React, { useRef, useState } from 'react'
import { Row, Col, Space, Typography, Menu, Button, Modal, message } from 'antd'
import { useSetState } from 'react-use'
import ProList from '@ant-design/pro-list'
import { deleteUser, getUsers } from '@/services/user'
import { PlusOutlined } from '@ant-design/icons'

export default (): React.ReactElement => {
  const [actionState, setActionState] = useSetState<{
    visible: boolean
    action: 'create' | 'edit'
    selectedUser: any
  }>({
    action: 'edit',
    visible: false,
    selectedUser: {},
  })

  const listRef = useRef<any>()

  return (
    <>
      <ProList<User>
        rowKey="_id"
        actionRef={listRef}
        pagination={{
          pageSize: 10,
        }}
        request={async (params = {}) => {
          const { current, pageSize } = params
          return getUsers(current, pageSize)
        }}
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
        metas={{
          title: {
            render: (dom, item) => <Typography.Title level={4}>{item.username}</Typography.Title>,
          },
          actions: {
            render: (dom, user: User) => [
              <Button
                size="small"
                key="edit"
                type="primary"
                onClick={() => {
                  setActionState({
                    action: 'edit',
                    selectedUser: {
                      ...user,
                      roles: user.roles.map((_) => _._id),
                    },
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
                disabled={user?.root}
                onClick={() => {
                  Modal.confirm({
                    title: `确认删除用户 ${user.username} ？`,
                    onOk: async () => {
                      await deleteUser(user._id)
                      message.success('删除用户成功！')
                      listRef?.current?.reload()
                    },
                  })
                }}
              >
                删除
              </Button>,
            ],
          },
          // description: {
          //   render: (dom, item) => (
          //     <div>
          //       {item.roles?.map((role: any, index: number) => {
          //         return (
          //           <Tag key={index} color="#2575e6">
          //             {role?.roleName}
          //           </Tag>
          //         )
          //       })}
          //     </div>
          //   ),
          // },
        }}
      />

      {/* <CreateUserModal
        state={actionState}
        onClose={() => setActionState({ visible: false })}
        onSuccess={() => {
          setActionState({
            visible: false,
          })
          listRef?.current?.reload()
        }}
      /> */}
    </>
  )
}
