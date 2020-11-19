import { useParams } from 'umi'
import React, { useState, useEffect } from 'react'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import { Layout, Button, Space } from 'antd'
import { ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import { SchmeaCtx } from 'typings/store'

import { SchemaExportModal, SchemaImportModal } from './components'
import SchemaContent from './SchmeaContent'
import SchemaMenuList from './SchemaMenuList'
import SchemaEditor from './SchemaEditor'
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

  // 模型导入导出
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
              ctx.mr.createSchema()
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
        {/* 模型菜单 */}
        <ProCard colSpan="220px" className="card-left" style={{ marginBottom: 0 }}>
          <SchemaMenuList />
        </ProCard>
        {/* 模型字段 */}
        <Layout className="schema-layout">
          <SchemaContent />
        </Layout>
      </ProCard>

      {/* 编辑弹窗 */}
      <SchemaEditor />
      <SchemaExportModal visible={exportVisible} onClose={() => setExportVisible(false)} />
      <SchemaImportModal visible={importVisible} onClose={() => setImportVisible(false)} />
    </PageContainer>
  )
}
