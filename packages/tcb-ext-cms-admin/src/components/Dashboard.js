import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'

export default (config) => (props) => (
  <div>
    <Card>
      <CardHeader title="云开发 CMS" />
      <CardContent>
        <h2>系统配置文件</h2>
        <code>
          <pre>{JSON.stringify(config, '', 2)}</pre>
        </code>
        <h2>系统特性</h2>
        <ul>
          <li>后台接口基于云开发生成（云函数+云数据库）</li>
          <li>登录鉴权采用云开发自定义登录</li>
          <li>管理界面根据数据配置，使用 React Admin 组件生成</li>
        </ul>
      </CardContent>
    </Card>
  </div>
)
