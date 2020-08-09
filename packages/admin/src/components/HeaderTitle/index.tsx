import React from 'react'
import { history } from 'umi'

const HeaderTitle: React.SFC<{ collapsed: boolean }> = (props) => (
    <a
        onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            history.push('/home')
        }}
    >
        <img src="/icon.svg" alt="logo" />
        <h1>{props.collapsed ? null : 'CloudBase CMS'}</h1>
    </a>
)

export default HeaderTitle
