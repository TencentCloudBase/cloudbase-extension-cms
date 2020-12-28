import React, { useCallback } from 'react'
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Menu, Spin, message, Dropdown } from 'antd'
import { history, useModel, useAccess } from 'umi'
import { getCloudBaseApp, getPageQuery, logout } from '@/utils'

import { stringify } from 'querystring'
import styles from './index.less'

export interface GlobalHeaderRightProps {
  menu?: boolean
}

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const app: any = await getCloudBaseApp()

  console.log(app)

  // 退出登录
  await logout()

  message.success('退出登录成功！')

  const { redirect } = getPageQuery()
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/login' && !redirect) {
    history.replace({
      pathname: '/login',
      search: stringify({
        redirect: window.location.href,
      }),
    })
  }
}

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  const { initialState, setInitialState } = useModel('@@initialState')
  const { isAdmin } = useAccess()

  const onMenuClick = useCallback((event: any) => {
    const { key } = event

    if (key === 'logout') {
      setInitialState({ ...initialState, currentUser: {} })
      loginOut()
      return
    }

    history.push(`/${key}`)
  }, [])

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  )

  if (!initialState) {
    return loading
  }

  const { currentUser } = initialState

  if (!currentUser?.username && !currentUser?._id) {
    return loading
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {isAdmin && (
        <Menu.Item key="settings">
          <SettingOutlined />
          系统设置
        </Menu.Item>
      )}

      {/* <Menu.Item key="personal">
                <UserOutlined />
                个人设置
            </Menu.Item> */}

      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown arrow overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account} cursor-pointer `}>
        {currentUser?.avatar ? (
          <Avatar alt="avatar" size="large" className={styles.avatar} src={currentUser?.avatar} />
        ) : (
          <Avatar
            alt="avatar"
            size="large"
            className={styles.avatar}
            style={{ backgroundColor: '#0052d9' }}
            icon={<UserOutlined />}
          />
        )}
        <span className="ml-3">{currentUser.username}</span>
      </span>
    </Dropdown>
  )
}

export default AvatarDropdown
