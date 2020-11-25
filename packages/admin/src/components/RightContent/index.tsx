import React from 'react'
import { useModel } from 'umi'
import { Tooltip, Tag, Space } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { getCmsConfig } from '@/utils'
import styles from './index.less'

export type SiderTheme = 'light' | 'dark'

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
}

const GlobalHeaderRight: React.FC<{}> = () => {
  const { initialState } = useModel('@@initialState')

  if (!initialState || !initialState.settings) {
    return null
  }

  const { navTheme, layout } = initialState.settings
  let className = styles.right

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`
  }

  return (
    <Space className={className}>
      <Tooltip title="使用文档">
        <a href={getCmsConfig('cmsDocLink')} target="_blank">
          <QuestionCircleOutlined />
        </a>
      </Tooltip>
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
    </Space>
  )
}
export default GlobalHeaderRight
