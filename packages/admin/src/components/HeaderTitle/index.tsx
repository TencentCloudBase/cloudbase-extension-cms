import React from 'react'
import { history } from 'umi'
import { getCmsConfig } from '@/utils'

const HeaderTitle: React.FC<{ collapsed: boolean }> = (props) => (
  <a
    onClick={(e) => {
      e.stopPropagation()
      e.preventDefault()
      history.push('/home')
    }}
  >
    <img src={getCmsConfig('cmsLogo')} alt="logo" style={{ height: '35px', width: '35px' }} />
    <h1>{props.collapsed ? null : getCmsConfig('cmsTitle')}</h1>
  </a>
)

export default HeaderTitle
