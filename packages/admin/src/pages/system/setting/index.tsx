import { history } from 'umi'
import React, { useState } from 'react'
import ProCard from '@ant-design/pro-card'
import { LeftCircleTwoTone } from '@ant-design/icons'
import { Row, Col, Space, Typography, Menu } from 'antd'
import styled from 'styled-components'
import UserManagement from './UserManagement'
import RoleManagement from './RoleManagement'
import MicroApp from './MicroApp'

const DEFAULT_TAB = 'microapp'
const Tabs = ['user', 'role']

const Container = styled.div`
  .ant-pro-card-body {
    padding: 0;
  }
`

export default (): React.ReactNode => {
  const tab = (history.location.query?.tab || '') as string
  const targetTab = Tabs.includes(tab as string) ? tab : DEFAULT_TAB
  const [selectedMenu, selectMenu] = useState<string>(targetTab)

  return (
    <Container>
      <Row className="pt-20">
        <Col flex="1 1 auto" />
        <Col flex="0 0 1080px">
          <div className="cursor-pointer" onClick={() => history.push('/home')}>
            <Space align="center" style={{ marginBottom: '10px' }}>
              <LeftCircleTwoTone style={{ fontSize: '20px' }} />
              <h3 style={{ marginBottom: '0.2rem' }}>返回主页</h3>
            </Space>
          </div>
          <Typography.Title level={3}>系统设置</Typography.Title>
          <ProCard split="vertical" gutter={[5, 5]} style={{ minHeight: '480px' }}>
            <ProCard colSpan="208px" className="pt-3">
              <Menu
                mode="inline"
                onClick={({ key }) => {
                  selectMenu(key as string)
                }}
                defaultSelectedKeys={[selectedMenu]}
              >
                <Menu.Item key="user">用户</Menu.Item>
                <Menu.Item key="role">角色</Menu.Item>
                <Menu.Item key="microapp">微应用</Menu.Item>
              </Menu>
            </ProCard>
            <ProCard>
              {selectedMenu === 'user' && <UserManagement />}
              {selectedMenu === 'role' && <RoleManagement />}
              {selectedMenu === 'microapp' && <MicroApp />}
            </ProCard>
          </ProCard>
        </Col>
        <Col flex="1 1 auto" />
      </Row>
    </Container>
  )
}
