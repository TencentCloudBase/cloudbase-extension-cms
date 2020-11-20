import React from 'react'
import { history } from 'umi'
import logo from '@/assets/logo.svg'
import { getCmsConfig } from '@/utils'

const HeaderTitle: React.SFC<{ collapsed: boolean }> = (props) => (
  <a
    onClick={(e) => {
      e.stopPropagation()
      e.preventDefault()
      history.push('/home')
    }}
  >
    <img src={logo} alt="logo" style={{ height: '35px', width: '35px' }} />
    <h1>{props.collapsed ? null : getCmsConfig('cmsTitle')}</h1>
  </a>
)

export default HeaderTitle
