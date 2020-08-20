import React from 'react'
import { GithubOutlined } from '@ant-design/icons'
import { DefaultFooter } from '@ant-design/pro-layout'

export default () => (
  <DefaultFooter
    copyright="2020 云开发"
    links={[
      {
        key: 'CloudBase CMS',
        title: 'CloudBase CMS',
        href: 'https://cloudbase.net',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/TencentCloudBase',
        blankTarget: true,
      },
      {
        key: 'CloudBase',
        title: 'CloudBase',
        href: 'https://cloudbase.net',
        blankTarget: true,
      },
    ]}
  />
)
