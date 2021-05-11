import { history } from 'umi'
import React, { useState } from 'react'
import ProCard from '@ant-design/pro-card'
import { LeftCircleTwoTone } from '@ant-design/icons'
import { Space, Typography, Menu } from 'antd'
import styled from 'styled-components'
import UserManagement from './UserManagement'
import RoleManagement from './RoleManagement'
import MicroApp from './MicroApp'
import CustomMenu from './CustomMenu'
import SettingContainer from './SettingContainer'

const { Title, Link } = Typography

const DEFAULT_TAB = 'user'
const Tabs = ['user', 'role', 'microapp', 'custommenu']

const Container = styled(SettingContainer)`
  .ant-pro-card-body {
    padding: 0;
  }
`

const TabMap = {
  user: <UserManagement />,
  role: <RoleManagement />,
  microapp: <MicroApp />,
  custommenu: <CustomMenu />,
}

export default (): React.ReactNode => {
  const tab = (history.location.query?.tab || '') as string
  const targetTab = Tabs.includes(tab as string) ? tab : DEFAULT_TAB
  const [selectedMenu, selectMenu] = useState<string>(targetTab)

  return (
    <Container>
      <div className="cursor-pointer" onClick={() => history.push('/home')}>
        <Space align="center" style={{ marginBottom: '10px' }}>
          <LeftCircleTwoTone style={{ fontSize: '20px' }} />
          <h3 style={{ marginBottom: '0.2rem' }}>返回主页</h3>
        </Space>
      </div>
      <div className="flex justify-between items-center mb-3">
        <Title level={3} className="mb-0">
          系统设置
        </Title>
        <Link
          className="text-base"
          href="https://docs.cloudbase.net/cms/intro.html"
          target="_blank"
        >
          使用文档
        </Link>
      </div>

      <ProCard split="vertical" gutter={[5, 5]} style={{ minHeight: '480px' }}>
        <ProCard colSpan="208px" className="pt-3">
          <Menu
            mode="inline"
            onClick={({ key }) => {
              selectMenu(key as string)
              history.push(`/settings?tab=${key}`)
            }}
            defaultSelectedKeys={[selectedMenu]}
          >
            <Menu.Item key="user">用户</Menu.Item>
            <Menu.Item key="role">角色</Menu.Item>
            <Menu.Item key="microapp">微应用</Menu.Item>
            <Menu.Item key="custommenu">自定义菜单</Menu.Item>
          </Menu>
        </ProCard>
        <ProCard>{TabMap[selectedMenu]}</ProCard>
      </ProCard>
    </Container>
  )
}
