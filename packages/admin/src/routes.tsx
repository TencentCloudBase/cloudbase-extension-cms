import React from 'react'
import { EyeOutlined, GoldOutlined, CrownOutlined, TableOutlined } from '@ant-design/icons'
import { MenuDataItem } from '@ant-design/pro-layout'

const IconMap = {
    eye: <EyeOutlined />,
    gold: <GoldOutlined />,
    crown: <CrownOutlined />,
    table: <TableOutlined />
}

const getRoutes = (projectId: string) => [
    {
        path: '/',
        layout: false,
        component: './index'
    },
    {
        path: `/${projectId}/home`,
        name: 'overview',
        icon: 'eye',
        component: './Overview'
    },
    {
        path: `/${projectId}/schema`,
        name: 'schema',
        icon: 'gold',
        component: './schema/index'
    },
    {
        path: `/${projectId}/content`,
        name: 'content',
        icon: 'gold',
        component: './content/index'
    },
    {
        path: `/${projectId}/admin`,
        name: 'admin',
        icon: 'crown',
        access: 'canAdmin',
        component: './Admin',
        routes: [
            {
                path: '/sub-page',
                name: 'sub-page',
                icon: 'smile',
                component: './Admin'
            }
        ]
    },
    {
        path: `/${projectId}/list`,
        icon: 'table',
        name: 'list.table-list',
        component: './ListTableList'
    },
    {
        path: '/user',
        layout: false,
        routes: [
            {
                name: 'login',
                path: '/user/login',
                component: './user/login'
            }
        ]
    },
    {
        component: './404'
    }
]

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
    menus.map(({ icon, children, ...item }) => ({
        ...item,
        icon: icon && IconMap[icon as string],
        children: children && loopMenuItem(children)
    }))

export const getMenuData = (projectId: string) => {
    const routes = getRoutes(projectId)

    return loopMenuItem(routes)
}
