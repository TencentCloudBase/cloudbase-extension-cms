import React from 'react'
import { SelectLang } from 'umi'
import { Avatar, Dropdown, Menu, Spin } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import './style.less'

export interface ILayoutRuntimeConfig {
    /** 导航用户退出的逻辑 默认不做处理 */
    logout?: (initialState: any) => void

    // TODO IMPORT initinfo  type from init plugin
    /** 自定义导航头右上角 ，有默认 UI, 接受 initialState & 修改 initialState 的方法 */
    rightRender?: (
        initialState: any,
        setInitialState: any,
        runtimeLayout: ILayoutRuntimeConfig
    ) => React.ReactNode

    errorBoundary?: {
        /** 发生错误后的回调（可做一些错误日志上报，打点等） */
        onError?: (error: Error, info: any) => void
        /** 发生错误后展示的组件，接受 error */
        ErrorComponent?: (error: Error) => React.ReactElement<any>
    }
}

export default function renderRightContent(
    runtimeLayout: ILayoutRuntimeConfig,
    loading: boolean,
    initialState: any,
    setInitialState: any
) {
    if (runtimeLayout.rightRender) {
        return runtimeLayout.rightRender(initialState, setInitialState, runtimeLayout)
    }

    const menu = (
        <Menu className="umi-plugin-layout-menu">
            <Menu.Item
                key="logout"
                onClick={() => runtimeLayout.logout && runtimeLayout?.logout(initialState)}
            >
                <LogoutOutlined />
                退出登录
            </Menu.Item>
        </Menu>
    )

    const avatar = (
        <span className="umi-plugin-layout-action">
            <Avatar
                size="small"
                className="umi-plugin-layout-avatar"
                src={
                    initialState?.avatar ||
                    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
                }
                alt="avatar"
            />
            <span className="umi-plugin-layout-name">{initialState?.name}</span>
        </span>
    )

    if (loading) {
        return (
            <div className="umi-plugin-layout-right">
                <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
            </div>
        )
    }

    return (
        initialState && (
            <div className="umi-plugin-layout-right">
                {runtimeLayout.logout ? (
                    <Dropdown overlay={menu} overlayClassName="umi-plugin-layout-container">
                        {avatar}
                    </Dropdown>
                ) : (
                    avatar
                )}
                {SelectLang && <SelectLang />}
            </div>
        )
    )
}
