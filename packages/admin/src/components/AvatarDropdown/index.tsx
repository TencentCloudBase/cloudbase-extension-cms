import React, { useCallback } from 'react'
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Menu, Spin } from 'antd'
import { history, useModel } from 'umi'
import { getPageQuery } from '@/utils/utils'
import { outLogin } from '@/services/login'

import { stringify } from 'querystring'
import HeaderDropdown from '../HeaderDropdown'
import styles from './index.less'

export interface GlobalHeaderRightProps {
    menu?: boolean
}

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
    await outLogin()
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

    const onMenuClick = useCallback((event: any) => {
        const { key } = event

        if (key === 'logout') {
            setInitialState({ ...initialState, currentUser: undefined })
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

    if (!currentUser || !currentUser.username) {
        return loading
    }

    const menuHeaderDropdown = (
        <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
            {currentUser.username === 'admin' && (
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
        <HeaderDropdown overlay={menuHeaderDropdown}>
            <span className={`${styles.action} ${styles.account}`}>
                {currentUser.avatar ? (
                    <Avatar
                        alt="avatar"
                        size="large"
                        className={styles.avatar}
                        src={currentUser.avatar}
                    />
                ) : (
                    <Avatar
                        alt="avatar"
                        size="large"
                        className={styles.avatar}
                        style={{ backgroundColor: '#0052d9' }}
                        icon={<UserOutlined />}
                    />
                )}
            </span>
        </HeaderDropdown>
    )
}

export default AvatarDropdown
