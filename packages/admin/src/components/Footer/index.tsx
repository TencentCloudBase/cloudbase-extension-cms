import React from 'react'
import { GithubOutlined } from '@ant-design/icons'
import { DefaultFooter } from '@ant-design/pro-layout'
import { getCmsConfig, getYear } from '@/utils'
import pkg from '../../../package.json'

export default () => (
  <DefaultFooter
    copyright={`2020-${getYear()} ${getCmsConfig('appName')}`}
    links={[
      {
        key: getCmsConfig('cmsTitle'),
        title: `${getCmsConfig('cmsTitle')} - ${pkg.version}`,
        href: WX_MP
          ? 'https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/extensions/cms/introduction.html'
          : getCmsConfig('officialSiteLink'),
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
        href: WX_MP
          ? 'https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html'
          : getCmsConfig('officialSiteLink'),
        blankTarget: true,
      },
    ]}
  />
)
