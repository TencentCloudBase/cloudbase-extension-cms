import { history } from 'umi'
import React, { useState } from 'react'
import ProCard from '@ant-design/pro-card'
import { LeftCircleTwoTone } from '@ant-design/icons'
import { Row, Col, Space, Typography, Menu } from 'antd'
import UserManagement from './UserManagement'
import RoleManagement from './RoleManagement'
import './index.less'

const Tabs = ['user', 'role']

export default (): React.ReactNode => {
  const { tab } = history.location.query || {}
  const targetTab = Tabs.includes(tab) ? tab : 'user'
  const [selectedMenu, selectMenu] = useState<string>(targetTab)

  return (
    <Row className="system-settings">
      <Col flex="1 1 auto" />
      <Col flex="0 0 1000px">
        <div className="back" onClick={() => history.push('/home')}>
          <Space align="center" style={{ marginBottom: '10px' }}>
            <LeftCircleTwoTone style={{ fontSize: '20px' }} />
            <h3 style={{ marginBottom: '0.2rem' }}>返回主页</h3>
          </Space>
        </div>
        <Typography.Title level={3}>系统设置</Typography.Title>
        <ProCard split="vertical" gutter={[5, 5]} style={{ minHeight: '480px' }}>
          <ProCard colSpan="208px" className="card-left">
            <Menu
              mode="inline"
              onClick={({ key }) => {
                selectMenu(key as string)
              }}
              defaultSelectedKeys={[selectedMenu]}
            >
              <Menu.Item key="user">用户</Menu.Item>
              <Menu.Item key="role">角色</Menu.Item>
            </Menu>
          </ProCard>
          <ProCard>
            {selectedMenu === 'user' && <UserManagement />}
            {selectedMenu === 'role' && <RoleManagement />}
          </ProCard>
        </ProCard>
      </Col>
      <Col flex="1 1 auto" />
    </Row>
  )
}
