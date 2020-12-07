import React, { useState } from 'react'
import { useRequest, history } from 'umi'
import ProList from '@ant-design/pro-list'
import { useConcent } from 'concent'
import { getUserRoles, deleteUserRole } from '@/services/role'
import { Button, Tag, Modal, Skeleton, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default (): React.ReactElement => {
  const [reload, setReload] = useState(0)
  const ctx = useConcent('role')

  const { data, loading } = useRequest(() => getUserRoles(), {
    refreshDeps: [reload],
  })

  if (loading) {
    return <Skeleton active />
  }

  return (
    <ProList<any>
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
      dataSource={data}
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
          render: (dom, item) => <div>{item.description}</div>,
        },
      }}
    />
  )
}
