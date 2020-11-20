import React from 'react'
import { GithubOutlined } from '@ant-design/icons'
import { DefaultFooter } from '@ant-design/pro-layout'
import { getCmsConfig } from '@/utils'

export default () => (
  <DefaultFooter
    copyright={`2020 ${getCmsConfig('appName')}`}
    links={[
      {
        key: getCmsConfig('cmsTitle'),
        title: getCmsConfig('cmsTitle'),
        href: getCmsConfig('officialSiteLink'),
        blankTarget: true,
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/TencentCloudBase',
        blankTarget: true,
      },
      {
        key: getCmsConfig('appName'),
        title: getCmsConfig('appName'),
        href: getCmsConfig('officialSiteLink'),
        blankTarget: true,
      },
    ]}
  />
)
