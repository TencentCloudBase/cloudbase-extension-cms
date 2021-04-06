import React from 'react'
import { useAccess } from 'umi'
import styled from 'styled-components'
import ProCard from '@ant-design/pro-card'
import { Tooltip, Typography } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import { redirectTo } from '@/utils'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'

const { Title, Paragraph } = Typography

const ListItem = styled.div`
  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }

  &:hover {
    transition: background-color 0.3s;
    background-color: rgba(163, 211, 255, 0.3);
    .create-icon {
      background-color: rgba(163, 211, 255, 0.5);
    }
  }
`

const ItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  width: 36px;
  height: 36px;
  font-size: 16px;
  border-radius: 5px;
  font-weight: bolder;
  background-color: #262f3e;
`

const CreateIcon = styled(ItemIcon)`
  transition: background-color 0.3s;
  background-color: rgba(163, 211, 255, 0.3);
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
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { isAdmin } = useAccess()

  return (
    <ProCard style={{ borderRadius: '5px' }} bodyStyle={{ padding: 0 }}>
      {projects.map((_, index) => (
        <ListItem
          key={index}
          className="flex items-center py-5 px-5"
          onClick={() => {
            ctx.setState({
              currentProject: _,
            })

            redirectTo('home', {
              projectId: _._id,
            })
          }}
        >
          <div className="w-2/4 flex items-center">
            <ItemIcon>{_.name.slice(0, 1)}</ItemIcon>
            <Tooltip title={_.name}>
              <Title level={5} ellipsis className="ml-5 mb-0" style={{ maxWidth: '80%' }}>
                {_.name}
              </Title>
            </Tooltip>
          </div>
          <Tooltip title={_.description}>
            <Paragraph ellipsis style={{ maxWidth: '80%', marginBottom: 0 }}>
              {_.description || '-'}
            </Paragraph>
          </Tooltip>
        </ListItem>
      ))}
      {isAdmin && (
        <ListItem className="flex items-center py-5 px-5" onClick={() => onCreateProject()}>
          <div className="w-2/4 flex items-center">
            <CreateIcon className="create-icon">
              <PlusCircleOutlined style={{ fontSize: '24px', color: '#0052d9' }} />
            </CreateIcon>

            <Title level={5} className="ml-5 mb-0">
              创建新项目
            </Title>
          </div>
        </ListItem>
      )}
    </ProCard>
  )
}
