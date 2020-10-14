import { useParams } from 'umi'
import React, { useState, useEffect, useCallback } from 'react'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import { Layout, Button, Space } from 'antd'
import { ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import { SchmeaCtx } from 'typings/store'

import SchemaList from './SchemaList'
import SchemaFiledList from './SchemaFiledList'
import { SchemaEditorModal } from './SchemaModal'
import { SchemaExportModal, SchemaImportModal } from './SchemaShare'
import './index.less'

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
  const ctx = useConcent<{}, SchmeaCtx>('schema')
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

  // 原型导入导出
  const [exportVisible, setExportVisible] = useState(false)
  const [importVisible, setImportVisible] = useState(false)

  // 获取 Schema 列表
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
          <Button type="primary" onClick={() => setExportVisible(true)}>
            <ExportOutlined />
            导出模型
          </Button>
          <Button type="primary" onClick={() => setImportVisible(true)}>
            <ImportOutlined />
            导入模型
          </Button>
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
      <SchemaExportModal visible={exportVisible} onClose={() => setExportVisible(false)} />
      <SchemaImportModal visible={importVisible} onClose={() => setImportVisible(false)} />
    </PageContainer>
  )
}
