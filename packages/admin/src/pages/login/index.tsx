import React from 'react'
import UserName from './UserName'
import WechatCode from './WechatCode'

const Login: React.FC = () => {
  return window.TcbCmsConfig.mpAppId ? <WechatCode /> : <UserName />
}

export default Login
