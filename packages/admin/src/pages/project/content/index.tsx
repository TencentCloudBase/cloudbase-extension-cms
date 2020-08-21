import { useParams } from 'umi'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import { Menu, Spin, Empty, Row, Col, Typography } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import React, { useEffect, useRef, useState } from 'react'
import { ContentDrawer } from './components'
import { ContentTable } from './ContentTable'
import './index.less'

export default (): React.ReactNode => {
  const { projectId } = useParams()
  const ctx = useConcent('content')
  const [contentModalVisible, setContentModalVisible] = useState(false)

  // 加载 schemas 数据
  useEffect(() => {
    ctx.dispatch('getContentSchemas', projectId)
  }, [])

  // table 引用
  const tableRef = useRef<{
    reload: (resetPageIndex?: boolean) => void
    reloadAndRest: () => void
    fetchMore: () => void
    reset: () => void
    clearSelected: () => void
  }>()

  const {
    state: { currentSchema, contentLoading, schemas, loading },
  } = ctx

  const defaultSelectedMenu = currentSchema ? [currentSchema._id] : []

  return (
    <PageContainer className="page-container">
      <ProCard split="vertical" gutter={[16, 16]} style={{ background: 'inherit' }}>
        <ProCard colSpan="220px" className="left-card" style={{ marginBottom: 0 }}>
          {loading ? (
            <Row justify="center">
              <Col>
                <Spin />
              </Col>
            </Row>
          ) : schemas?.length ? (
            <Menu
              mode="inline"
              defaultSelectedKeys={defaultSelectedMenu}
              onClick={({ key }) => {
                const schema = schemas.find((item: SchemaV2) => item._id === key)

                ctx.setState({
                  contentLoading: true,
                  currentSchema: schema,
                })

                if (tableRef?.current) {
                  tableRef.current?.reset()
                }

                setTimeout(() => {
                  if (tableRef?.current) {
                    ctx.setState({
                      contentLoading: false,
                    })
                    tableRef.current?.reloadAndRest()
                  }
                }, 30)
              }}
            >
              {schemas.map((item: SchemaV2) => (
                <Menu.Item key={item._id}>{item.displayName}</Menu.Item>
              ))}
            </Menu>
          ) : (
            <Row justify="center">
              <Col>内容数据为空</Col>
            </Row>
          )}
        </ProCard>
        <ProCard className="content-card" style={{ marginBottom: 0 }}>
          {currentSchema ? (
            contentLoading ? null : (
              <ContentTable
                tableRef={tableRef}
                setModalVisible={(visible: boolean) => setContentModalVisible(visible)}
              />
            )
          ) : (
            <div className="content-empty">
              <Empty description="创建你的原型，开始使用 CMS">未选择内容</Empty>
            </div>
          )}
        </ProCard>
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
