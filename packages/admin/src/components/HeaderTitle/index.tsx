import React from 'react'

const HeaderTitle: React.SFC<{ collapsed: boolean }> = (props) => (
    <a href="/">
        <img src="/img/logo.png" alt="logo" />
        <h1>{props.collapsed ? null : 'CloudBase CMS'}</h1>
    </a>
)

export default HeaderTitle
