import React, { useRef } from 'react'
import { history } from 'umi'
import { PlusOutlined } from '@ant-design/icons'
import { Typography, Button, Modal, message } from 'antd'
import ProList from '@ant-design/pro-list'
import { useConcent } from 'concent'
import { MicroAppCtx } from 'typings/store'
import { deleteMicroApp, getSetting } from '@/services/global'

const { Title, Link } = Typography

export default (): React.ReactElement => {
  const appCtx = useConcent<{}, MicroAppCtx>('microApp')
  const listRef = useRef<any>()

  return (
    <ProList<MicroApp>
      rowKey="_id"
      actionRef={listRef}
      pagination={{
        pageSize: 10,
      }}
      request={async () => {
        const { data: setting } = await getSetting()
        const microApps = setting?.microApps || []
        return {
          data: microApps,
          total: microApps?.length,
        }
      }}
      toolBarRender={() => {
        return [
          <Button
            key="new"
            type="primary"
            onClick={() => {
              appCtx.setState({
                appAction: 'create',
                selectedApp: null,
              })
              history.push('/settings/microapp/edit')
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]
      }}
      metas={{
        title: {
          render: (dom, item) => <Title level={4}>{item.title}</Title>,
        },
        description: {
          render: (dom, item) => {
            return `应用 ID：${item.id}`
          },
        },
        actions: {
          render: (dom, app) => [
            <Button
              size="small"
              key="edit"
              type="primary"
              onClick={() => {
                appCtx.setState({
                  appAction: 'edit',
                  selectedApp: app,
                })
                history.push('/settings/microapp/edit')
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
                  title: `确认删除微应用 ${app.title} ？`,
                  content: '此操作将会同步删除静态网站内容，微应用将无法继续访问！',
                  onOk: async () => {
                    await deleteMicroApp(app)
                    message.success('删除微应用成功！')
                    listRef?.current?.reload()
                  },
                })
              }}
            >
              删除
            </Button>,
          ],
        },
      }}
    />
  )
}
