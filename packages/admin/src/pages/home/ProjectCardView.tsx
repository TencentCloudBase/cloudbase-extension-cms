import React from 'react'
import { useAccess } from 'umi'
import styled from 'styled-components'
import { Card, Tooltip, Typography } from 'antd'
import { PlusCircleTwoTone } from '@ant-design/icons'
import { redirectTo } from '@/utils'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'

const { Title, Paragraph } = Typography

const ProjectContainer = styled.div`
  gap: 30px 20px;
  display: grid;
  margin-left: -15px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: repeat(auto-fill, 110px);
`

const ProjectIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  width: 50px;
  height: 50px;
  font-size: 28px;
  border-radius: 10px;
  font-weight: bolder;
  background-color: #262f3e;
`

const ProjectItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  &:hover {
    background-color: rgba(163, 211, 255, 0.3);
    transition: background-color 0.3s;
  }
`
const cardStyle = {
  height: '80px',
  borderRadius: '10px',
  boxShadow: '0 3px 6px rgb(12 18 100 / 6%)',
}

const cardBodyStyle = {
  padding: '15px',
}

/**
 * 项目 card 视图
 */
export default function ProjectListView({
  projects,
  onCreateProject,
}: {
  projects: Project[]
  onCreateProject: () => void
}) {
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { isAdmin } = useAccess()

  return (
    <ProjectContainer>
      {projects.map((project, index) => (
        <ProjectItem
          key={index}
          onClick={() => {
            ctx.setState({
              currentProjectId: project._id,
            })
            redirectTo('home', {
              projectId: project._id,
            })
          }}
        >
          <Card bordered={false} style={cardStyle} bodyStyle={cardBodyStyle}>
            <ProjectIcon className="flex items-center">{project.name.slice(0, 1)}</ProjectIcon>
          </Card>
          <div className="ml-5 flex-1" style={{ maxWidth: '140px' }}>
            <Tooltip title={project.name} placement="topLeft">
              <Title level={4} ellipsis>
                {project.name}
              </Title>
            </Tooltip>
            <Tooltip title={project.description} placement="bottomLeft">
              <Paragraph ellipsis={{ rows: 2, expandable: false }} className="mb-0">
                {project.description || ''}
              </Paragraph>
            </Tooltip>
          </div>
        </ProjectItem>
      ))}
      {isAdmin && <CreateProject onClick={onCreateProject} />}
    </ProjectContainer>
  )
}

const CreateProject: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <ProjectItem onClick={onClick}>
      <Card bordered={false} style={cardStyle} bodyStyle={cardBodyStyle}>
        <ProjectIcon style={{ backgroundColor: '#fff' }}>
          <PlusCircleTwoTone style={{ fontSize: '46px' }} />
        </ProjectIcon>
      </Card>
      <div className="ml-5 flex-1">
        <Typography.Title level={4} ellipsis={{ rows: 2, expandable: false }}>
          创建新项目
        </Typography.Title>
      </div>
    </ProjectItem>
  )
}
