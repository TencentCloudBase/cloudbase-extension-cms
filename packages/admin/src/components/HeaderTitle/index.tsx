import React from 'react'
import { history } from 'umi'
import { getCmsConfig, getPageQuery } from '@/utils'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { getProject } from '@/services/project'
import useRequest from '@umijs/use-request'
import { Spin } from 'antd'

const HeaderTitle: React.FC<{ collapsed: boolean }> = (props) => {
  const { pid } = getPageQuery()
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { currentProject } = ctx.state

  const { data, loading } = useRequest(async () => {
    if (currentProject) return

    const { data } = await getProject(pid)
    return data
  })

  const title = currentProject?.name || data?.name || getCmsConfig('cmsTitle')

  return (
    <a
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        history.push('/home')
      }}
    >
      <img src={getCmsConfig('cmsLogo')} alt="logo" style={{ height: '35px', width: '35px' }} />
      {loading && !currentProject ? (
        <Spin className="ml-5" />
      ) : (
        <h1>{props.collapsed ? null : title}</h1>
      )}
    </a>
  )
}

export default HeaderTitle
