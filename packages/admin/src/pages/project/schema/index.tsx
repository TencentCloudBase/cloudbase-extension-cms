import { useParams } from 'umi'
import React, { useState, useEffect, useCallback } from 'react'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import { Layout, Button, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import { CtxM } from 'typings/store'

import SchemaList from './SchemaList'
import SchemaFiledList from './SchemaFiledList'
import { SchemaEditorModal } from './SchemaModal'

import './index.less'

type Ctx = CtxM<{}, 'schema'> // 属于schema模块的实例上下文类型

export interface TableListItem {
  key: number
  name: string
  status: string
  updatedAt: number
  createdAt: number
  progress: number
  money: number
}

export default (): React.ReactNode => {
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, Ctx>('schema')
  const {
    state: { currentSchema },
  } = ctx

  // 编辑 Schema
  const [schemaVisible, setSchemaVisible] = useState(false)
  const [schemaAction, setSchemaAction] = useState<'create' | 'edit'>('create')
  const onSchemaChange = useCallback((action: 'edit' | 'create', visible: boolean) => {
    setSchemaAction(action)
    setSchemaVisible(visible)
  }, [])

  // 获取 Schema
  useEffect(() => {
    ctx.mr.getSchemas(projectId)
  }, [])

  return (
    <PageContainer
      className="schema-page-container"
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setSchemaVisible(true)
              setSchemaAction('create')
            }}
          >
            <PlusOutlined />
            新建模型
          </Button>
          <Button>导入模型</Button>
        </Space>
      }
    >
      <ProCard split="vertical" gutter={[16, 16]} style={{ background: 'inherit' }}>
        <ProCard colSpan="220px" className="card-left" style={{ marginBottom: 0 }}>
          <SchemaList />
        </ProCard>
        <Layout className="schema-layout">
          <SchemaFiledList onSchemaChange={onSchemaChange} />
        </Layout>
      </ProCard>

      <SchemaEditorModal
        action={schemaAction}
        schema={currentSchema}
        visible={schemaVisible}
        onClose={() => setSchemaVisible(false)}
      />
    </PageContainer>
  )
}
