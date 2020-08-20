import React from 'react'
import { Spin } from 'antd'

// loading components from code split
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport
export default () => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spin tip="加载中" size="large" />
  </div>
)
