import { history } from 'umi'
import { useConcent } from 'concent'
import React, { useRef } from 'react'
import ProList from '@ant-design/pro-list'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Tag, Modal, Typography, message } from 'antd'
import { getUserRoles, deleteUserRole } from '@/services/role'

export default (): React.ReactElement => {
  const ctx = useConcent('role')

  const listRef = useRef<any>()

  return (
    <ProList<any>
      actionRef={listRef}
      pagination={{
        pageSize: 10,
      }}
      request={async (params = {}) => {
        const { current, pageSize } = params
        return getUserRoles(current, pageSize)
      }}
      toolBarRender={() => [
        <Button
          key="new"
          type="primary"
          onClick={() => {
            ctx.setState({
              roleAction: 'create',
              selectedRole: null,
            })
            history.push('/settings/role/edit')
          }}
        >
          <PlusOutlined />
          新建
        </Button>,
      ]}
      rowKey="id"
      metas={{
        title: {
          render: (dom, item) => (
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {item.roleName}
            </Typography.Title>
          ),
        },
        subTitle: {
          render: (dom, item) => item.type === 'system' && <Tag color="#2575e6">系统</Tag>,
        },
        actions: {
          render: (dom, item) => [
            <Button
              size="small"
              key="edit"
              type="primary"
              onClick={() => {
                ctx.setState({
                  roleAction: 'edit',
                  selectedRole: item,
                })
                history.push('/settings/role/edit')
              }}
            >
              编辑
            </Button>,
            <Button
              danger
              size="small"
              key="delete"
              type="primary"
              disabled={item.type === 'system'}
              onClick={() => {
                Modal.confirm({
                  title: `确认删除角色【${item.roleName}】？`,
                  onOk: async () => {
                    await deleteUserRole(item._id)
                    listRef?.current?.reloadAndRest()
                    message.success('删除角色成功')
                  },
                })
              }}
            >
              删除
            </Button>,
          ],
        },
        description: {
          render: (dom, item) => <div>{item.description}</div>,
        },
      }}
    />
  )
}
