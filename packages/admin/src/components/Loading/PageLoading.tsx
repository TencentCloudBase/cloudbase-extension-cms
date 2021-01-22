import React from 'react'
import { Spin } from 'antd'

export default () => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spin tip="加载中" size="large" />
  </div>
)
