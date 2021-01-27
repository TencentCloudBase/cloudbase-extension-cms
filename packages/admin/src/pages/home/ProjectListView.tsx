import React from 'react'
import { history, useAccess } from 'umi'
import styled from 'styled-components'
import ProCard from '@ant-design/pro-card'
import { Tooltip, Typography } from 'antd'
import { PlusCircleTwoTone } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const ListItem = styled.div`
  cursor: pointer;
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
  &:hover {
    background-color: rgba(163, 211, 255, 0.3);
    transition: background-color 0.3s;
  }
`

const ProjectLogo = styled.div`
  color: #fff;
  width: 36px;
  height: 36px;
  font-size: 16px;
  border-radius: 5px;
  font-weight: bolder;
  background-color: #262f3e;
`

/**
 * 项目 list 视图
 */
export default function ProjectListView({
  projects,
  onCreateProject,
}: {
  projects: Project[]
  onCreateProject: () => void
}) {
  const { isAdmin } = useAccess()

  return (
    <ProCard style={{ borderRadius: '5px' }} bodyStyle={{ padding: 0 }}>
      {projects.map((_, index) => (
        <ListItem
          key={index}
          className="flex items-center py-5 px-5"
          onClick={() => {
            history.push(`/${_._id}/home`)
          }}
        >
          <div className="w-2/4 flex items-center">
            <ProjectLogo className="flex items-center justify-center">
              {_.name.slice(0, 1)}
            </ProjectLogo>
            <Tooltip title={_.name}>
              <Title level={5} ellipsis className="ml-5 mb-0" style={{ maxWidth: '80%' }}>
                {_.name}
              </Title>
            </Tooltip>
          </div>
          <Tooltip title={_.description}>
            <Paragraph ellipsis style={{ maxWidth: '80%' }}>
              {_.description || '-'}
            </Paragraph>
          </Tooltip>
        </ListItem>
      ))}
      {isAdmin && (
        <ListItem className="flex items-center py-5 px-5" onClick={() => onCreateProject()}>
          <div className="w-2/4 flex items-center">
            <div className="flex items-center justify-center">
              <PlusCircleTwoTone style={{ fontSize: '32px' }} />
            </div>
            <Title level={5} className="ml-5 mb-0">
              创建新项目
            </Title>
          </div>
        </ListItem>
      )}
    </ProCard>
  )
}
