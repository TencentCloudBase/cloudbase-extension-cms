import React from 'react'
import { useRequest } from 'umi'
import { useSetState } from 'react-use'
import { getUserRoles } from '@/services/role'
import { Button, Space, message, Modal, Form, Input, Select } from 'antd'

/**
 * 微信，通过二位码添加用户
 */
export default ({
  state,
  onClose,
  onSuccess,
}: {
  state: {
    visible: boolean
    action: 'create' | 'edit'
    selectedUser?: any
  }
  onClose: () => void
  onSuccess: () => void
}) => {
  const { visible, action, selectedUser } = state
  const [{ qrCodeUrl, qrCodeVisible }, setState] = useSetState({
    qrCodeVisible: false,
    qrCodeUrl: '',
  })

  // 加载用户角色
  const { data: userRoles = [] } = useRequest(() => getUserRoles())

  return (
    <>
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
            // TODO: 显示二维码弹窗 ?
          }}
        >
          <Form.Item
            label="用户微信号"
            name="username"
            rules={[
              {
                required: true,
                message: '用户微信号不能为空',
              },
            ]}
          >
            <Input placeholder="请输入需要添加用户的微信号" disabled={action === 'edit'} />
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
              <Button type="primary" htmlType="submit">
                {`${action === 'create' ? '添加' : '更新'}`}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal centered destroyOnClose footer={null} visible={qrCodeVisible}>
        <img height="200" src={qrCodeUrl} />
      </Modal>
    </>
  )
}
