import { useParams } from 'umi'
import { useConcent } from 'concent'

import React, { useState, useEffect, useCallback } from 'react'
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons'
import { Layout, Row, Col, Spin, Button, Empty, Space, Typography } from 'antd'
import { CtxM } from 'typings/store'

import { DeleteFieldModal } from './Field'
import { FieldEditorModal } from './FieldEditor'
import { SchemaFieldRender } from './FieldItemRender'
import { DeleteSchemaModal } from './SchemaModal'
import SchemaFieldPicker from './SchemaFieldPicker'
import './index.less'

const { Content } = Layout
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

const SchemaFieldList: React.FC<{
  onSchemaChange: (action: 'create' | 'edit', v: boolean) => void
}> = ({ onSchemaChange }) => {
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, Ctx>('schema')
  const {
    state: { currentSchema, loading },
  } = ctx

  const [deleteSchemaVisible, setDeleteSchmeaVisible] = useState(false)
  // 新增字段
  const [fieldVisible, setFieldVisible] = useState(false)
  // 删除字段
  const [deleteFieldVisible, setDeleteFieldVisible] = useState(false)

  useEffect(() => {
    ctx.mr.getSchemas(projectId)
  }, [])

  const editFiled = useCallback((field: SchemaFieldV2) => {
    ctx.setState({
      fieldAction: 'edit',
      selectedField: field,
    })
    setFieldVisible(true)
  }, [])

  return (
    <>
      <Content className="full-height schema-layout-content">
        {currentSchema?._id ? (
          <Row>
            <Col flex="1 1 auto" />
            <Col flex="0 1 600px">
              <Space className="schema-layout-header">
                <Typography.Title level={3}>{currentSchema.displayName}</Typography.Title>
                <Space size="middle">
                  <EditTwoTone
                    style={{ fontSize: '16px' }}
                    onClick={() => {
                      onSchemaChange('edit', true)
                    }}
                  />
                  <DeleteTwoTone
                    style={{ fontSize: '16px' }}
                    onClick={() => setDeleteSchmeaVisible(true)}
                  />
                </Space>
              </Space>
              <Content>
                {currentSchema?.fields?.length ? (
                  <SchemaFieldRender
                    onFiledClick={(field) => editFiled(field)}
                    schema={currentSchema}
                    actionRender={(field) => (
                      <Space>
                        <Button
                          size="small"
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            editFiled(field)
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          danger
                          size="small"
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation()
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
        ) : loading ? (
          <div className="schema-empty">
            <Spin tip="加载中" />
          </div>
        ) : (
          <div className="schema-empty">
            <Empty description="创建你的模型，开始使用 CMS">
              <Button
                type="primary"
                onClick={() => {
                  onSchemaChange('create', true)
                }}
              >
                创建模型
              </Button>
            </Empty>
          </div>
        )}
      </Content>
      <SchemaFieldPicker onCreateField={() => setFieldVisible(true)} />

      <DeleteSchemaModal
        visible={deleteSchemaVisible}
        onClose={() => setDeleteSchmeaVisible(false)}
      />
      <FieldEditorModal visible={fieldVisible} onClose={() => setFieldVisible(false)} />
      <DeleteFieldModal visible={deleteFieldVisible} onClose={() => setDeleteFieldVisible(false)} />
    </>
  )
}

export default SchemaFieldList
