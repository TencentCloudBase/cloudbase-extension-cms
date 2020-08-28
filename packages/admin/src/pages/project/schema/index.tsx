import { useParams } from 'umi'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import React, { useState, useEffect, useCallback } from 'react'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Card,
  Layout,
  Menu,
  List,
  Row,
  Col,
  Spin,
  Button,
  message,
  Empty,
  Space,
  Popover,
  Typography,
  Tooltip,
} from 'antd'
import { FieldTypes } from '@/common'
import { PageContainer } from '@ant-design/pro-layout'

import { SchemaFieldRender } from './FieldRender'
import { CreateFieldModal, DeleteFieldModal } from './FieldModal'
import { SchemaModal, DeleteSchemaModal } from './SchemaModal'
import './index.less'

const { Sider, Content } = Layout

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
  // projectId
  const { projectId } = useParams()
  const ctx = useConcent('schema')
  const {
    state: { currentSchema, schemas, loading },
  } = ctx

  const [schemaAction, setSchemaAction] = useState<'create' | 'edit'>('create')
  const [schemaVisible, setSchemaVisible] = useState(false)
  const [deleteSchemaVisible, setDeleteSchmeaVisible] = useState(false)
  // 新增字段
  const [fieldVisible, setFieldVisible] = useState(false)
  // 删除字段
  const [deleteFieldVisible, setDeleteFieldVisible] = useState(false)

  useEffect(() => {
    ctx.dispatch('getSchemas', projectId)
  }, [])

  const defaultSelectedMenu = currentSchema?._id ? [currentSchema._id] : []

  const editFiled = useCallback((field: SchemaFieldV2) => {
    ctx.setState({
      fieldAction: 'edit',
      selectedField: field,
    })
    setFieldVisible(true)
  }, [])

  return (
    <PageContainer
      className="schema-page-container"
      extra={
        <h2 className="full-height">
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
        </h2>
      }
    >
      <ProCard split="vertical" gutter={[16, 16]} style={{ background: 'inherit' }}>
        <ProCard colSpan="220px" className="card-left" style={{ marginBottom: 0 }}>
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
                const schema = schemas.find((item: any) => item._id === key)

                ctx.setState({
                  currentSchema: schema,
                })
              }}
            >
              {schemas.map((item: SchemaV2) => (
                <Menu.Item key={item._id}>{item.displayName}</Menu.Item>
              ))}
            </Menu>
          ) : (
            <Row justify="center">
              <Col>模型为空</Col>
            </Row>
          )}
        </ProCard>

        <Layout className="schema-layout">
          <Content className="full-height schema-layout-content">
            {currentSchema?._id ? (
              <Row>
                <Col flex="1 1 auto" />
                <Col flex="0 1 600px">
                  <Space className="schema-layout-header">
                    <Typography.Title level={3}>{currentSchema.displayName}</Typography.Title>
                    <Popover
                      placement="bottom"
                      content={
                        <Space>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                              setSchemaVisible(true)
                              setSchemaAction('edit')
                            }}
                          >
                            编辑模型
                          </Button>
                          <Button
                            danger
                            type="primary"
                            size="small"
                            onClick={() => setDeleteSchmeaVisible(true)}
                          >
                            删除模型
                          </Button>
                        </Space>
                      }
                    >
                      <EditOutlined
                        style={{
                          fontSize: '18px',
                        }}
                        onClick={() => {}}
                      />
                    </Popover>
                    {currentSchema.description && (
                      <Tooltip title={currentSchema.description}>
                        <Typography.Text
                          ellipsis
                          style={{
                            marginLeft: '10px',
                            maxWidth: '240px',
                          }}
                        >
                          {currentSchema.description}
                        </Typography.Text>
                      </Tooltip>
                    )}
                  </Space>
                  <Content>
                    {currentSchema?.fields?.length ? (
                      <SchemaFieldRender
                        onFiledClick={(field) => editFiled(field)}
                        schema={currentSchema}
                        actionRender={(field) => (
                          <Space>
                            <Button size="small" type="primary" onClick={() => editFiled(field)}>
                              编辑
                            </Button>
                            <Button
                              danger
                              size="small"
                              type="primary"
                              onClick={() => {
                                ctx.setState({
                                  selectedField: field,
                                })
                                setDeleteFieldVisible(true)
                              }}
                            >
                              删除
                            </Button>
                          </Space>
                        )}
                      />
                    ) : (
                      <div className="schema-empty">
                        <Empty description="点击右侧字段类型，添加一个字段" />
                      </div>
                    )}
                  </Content>
                </Col>
                <Col flex="1 1 auto" />
              </Row>
            ) : (
              <div className="schema-empty">
                <Empty description="创建你的模型，开始使用 CMS">
                  <Button
                    type="primary"
                    onClick={() => {
                      setSchemaVisible(true)
                      setSchemaAction('create')
                    }}
                  >
                    创建模型
                  </Button>
                </Empty>
              </div>
            )}
          </Content>

          <Sider className="schema-sider" width="220">
            <Typography.Title level={3} className="schema-sider-header">
              模型类型
            </Typography.Title>
            <List
              bordered={false}
              dataSource={FieldTypes}
              renderItem={(item) => (
                <Card
                  hoverable
                  className="field-card"
                  onClick={() => {
                    if (!currentSchema) {
                      message.info('请选择需要编辑的模型')
                      return
                    }
                    ctx.setState({
                      fieldAction: 'create',
                      selectedField: item,
                    })
                    setFieldVisible(true)
                  }}
                >
                  <List.Item className="item">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </List.Item>
                </Card>
              )}
            />
          </Sider>
        </Layout>
      </ProCard>

      <SchemaModal
        action={schemaAction}
        visible={schemaVisible}
        schema={currentSchema}
        onClose={() => setSchemaVisible(false)}
      />
      <DeleteSchemaModal
        visible={deleteSchemaVisible}
        onClose={() => setDeleteSchmeaVisible(false)}
      />
      <CreateFieldModal visible={fieldVisible} onClose={() => setFieldVisible(false)} />

      <DeleteFieldModal visible={deleteFieldVisible} onClose={() => setDeleteFieldVisible(false)} />
    </PageContainer>
  )
}
