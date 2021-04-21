import React from 'react'
import { Spin, SpinProps } from 'antd'

export const ContentLoading: React.FC<{ tip?: string } & SpinProps> = ({
  tip = '加载中',
  ...spinProps
}) => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spin tip={tip} size="large" {...spinProps} />
  </div>
)
