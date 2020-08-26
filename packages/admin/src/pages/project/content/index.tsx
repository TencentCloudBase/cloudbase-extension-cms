import { Empty, Button } from 'antd'
import { history, useParams } from 'umi'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import React, { useRef, useState, useEffect } from 'react'
import { ContentDrawer } from './components'
import { ContentTable } from './ContentTable'
import './index.less'

export default (props: any): React.ReactNode => {
  const { schemaId, projectId } = useParams()
  const ctx = useConcent('content')
  const [contentModalVisible, setContentModalVisible] = useState(false)

  // table 引用
  const tableRef = useRef<{
    reload: (resetPageIndex?: boolean) => void
    reloadAndRest: () => void
    fetchMore: () => void
    reset: () => void
    clearSelected: () => void
  }>()

  const {
    state: { schemas },
  } = ctx

  const currentSchema = schemas?.find((item: SchemaV2) => item._id === schemaId)

  // 切换 schema 时重新加载数据
  useEffect(() => {
    tableRef.current?.reloadAndRest()
  }, [currentSchema])

  return (
    <PageContainer className="page-container">
      <ProCard className="content-card" style={{ marginBottom: 0 }}>
        {currentSchema ? (
          currentSchema?.fields?.length ? (
            <ContentTable
              currentSchema={currentSchema}
              tableRef={tableRef}
              setModalVisible={(visible: boolean) => setContentModalVisible(visible)}
            />
          ) : (
            <Empty description="当前内容模型字段为空，请添加字段后再创建内容">
              <Button
                type="primary"
                onClick={() => {
                  history.push(`/${projectId}/schema`)
                }}
              >
                添加字段
              </Button>
            </Empty>
          )
        ) : (
          <div className="content-empty">
            <Empty
              description={
                <>
                  <span>内容模型为空 🤔</span>
                  <br />
                  <span>创建你的内容模型，开始使用 CMS</span>
                </>
              }
            >
              <Button
                type="primary"
                onClick={() => {
                  history.push(`/${projectId}/schema`)
                }}
              >
                创建模型
              </Button>
            </Empty>
          </div>
        )}
      </ProCard>
      <ContentDrawer
        schema={currentSchema}
        visible={contentModalVisible}
        onClose={() => setContentModalVisible(false)}
        onOk={() => {
          setContentModalVisible(false)
          tableRef?.current?.reload()
        }}
      />
    </PageContainer>
  )
}
