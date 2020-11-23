import React from 'react'
import UserName from './UserName'
import WechatCode from './WechatCode'

const Login: React.FC = () => {
  // TODO: return window.TcbCmsConfig.mpAppID ? <WechatCode /> : <UserName />
  return <UserName />
}

export default Login
