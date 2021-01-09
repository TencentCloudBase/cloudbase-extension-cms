import React from 'react'
import { Button } from 'antd'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { history, useParams, useRequest } from 'umi'
import { createBatchTask } from '@/services/operation'

export default (): React.ReactNode => {
  return (
    <PageContainer>
      <ProCard>
        <Task />
      </ProCard>
    </PageContainer>
  )
}

const Task: React.FC = () => {
  const { projectId } = useParams<any>()

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          history.push(`/${projectId}/operation/message/create`)
        }}
      >
        群发短信
      </Button>
    </div>
  )
}
