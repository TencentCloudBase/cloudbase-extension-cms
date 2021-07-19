import React from 'react'
import { Link } from 'umi'
import { getCmsConfig, getPageQuery, redirectTo } from '@/utils'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { getProjects } from '@/services/project'
import useRequest from '@umijs/use-request'
import { Dropdown, Menu, Spin } from 'antd'
import { CaretDownOutlined } from '@ant-design/icons'

const HeaderTitle: React.FC<{ collapsed: boolean }> = (props) => {
  const { pid } = getPageQuery()
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { currentProject } = ctx.state

  // 获取全部项目
  const { data: projects = [], loading } = useRequest(async () => {
    const { data } = await getProjects()
    return data
  })

  const title =
    currentProject?.name || projects.find((_) => _._id === pid)?.name || getCmsConfig('cmsTitle')

  const menu = (
    <Menu
      onClick={({ key }) => {
        const project = projects.find((_) => _._id === key)
        ctx.setState({
          currentProject: project,
        })
        redirectTo('home', {
          projectId: key as string,
        })
      }}
    >
      {projects.map((_) => (
        <Menu.Item key={_._id}>{_.name}</Menu.Item>
      ))}
    </Menu>
  )

  return (
    <div className="h-full flex items-center">
      <Link to="/home">
        <img src={getCmsConfig('cmsLogo')} alt="logo" style={{ height: '35px', width: '35px' }} />
      </Link>

      {props.collapsed ? null : loading && !currentProject ? (
        <Spin className="ml-5" />
      ) : (
        <Dropdown overlay={menu} trigger={['click']}>
          <h2 className="text-white m-0 ml-5 cursor-pointer text-lg">
            {title}
            &nbsp;
            <CaretDownOutlined className="text-bold text-base" />
          </h2>
        </Dropdown>
      )}
    </div>
  )
}

export default HeaderTitle
