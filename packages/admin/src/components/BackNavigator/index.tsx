import React from 'react'
import { Space } from 'antd'
import { history } from 'umi'
import { LeftCircleTwoTone } from '@ant-design/icons'

export interface IAppProps {
  children?: React.ReactNode
}

export default function BackNavigator({ children }: IAppProps) {
  return (
    <div className="cursor-pointer" onClick={() => history.goBack()}>
      <Space align="center" style={{ marginBottom: '20px' }}>
        <LeftCircleTwoTone style={{ fontSize: '20px' }} />
        <h3 style={{ marginBottom: '0.2rem' }}>返回</h3>
      </Space>
    </div>
  )
}
