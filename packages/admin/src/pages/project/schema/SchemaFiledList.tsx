import { useConcent } from 'concent'
import React, { useState, useCallback } from 'react'
import { EditTwoTone, DeleteTwoTone, ExportOutlined } from '@ant-design/icons'
import { Layout, Row, Col, Spin, Button, Empty, Space, Typography, message, Modal } from 'antd'
import { SchmeaCtx } from 'typings/store'
import { random, saveContentToFile } from '@/utils'

import { DeleteFieldModal } from './Field'
import { FieldEditorModal } from './FieldEditor'
import { SchemaFieldRender } from './FieldItemRender'
import { DeleteSchemaModal } from './SchemaModal'
import SchemaFieldPicker from './SchemaFieldPicker'
import './index.less'

const { Content } = Layout

export interface TableListItem {
  key: number
  name: string
  status: string
  updatedAt: number
  createdAt: number
  progress: number
  money: number
}

const iconStyle = {
  fontSize: '16px',
}

const SchemaFieldList: React.FC<{
  onSchemaChange: (action: 'create' | 'edit', v: boolean) => void
}> = ({ onSchemaChange }) => {
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const {
    state: { currentSchema, loading },
  } = ctx

  // 新增字段
  const [fieldVisible, setFieldVisible] = useState(false)
  // 删除字段
  const [deleteFieldVisible, setDeleteFieldVisible] = useState(false)
  // 删除原型
  const [deleteSchemaVisible, setDeleteSchmeaVisible] = useState(false)

  // 编辑字段
  const editFiled = useCallback((field: SchemaFieldV2) => {
    ctx.setState({
      fieldAction: 'edit',
      selectedField: field,
    })
    setFieldVisible(true)
  }, [])

  // 导出 Schema 数据
  const exportSchema = useCallback(() => {
    const modal = Modal.confirm({
      title: '确认导出原型数据？',
      onCancel: () => {
        modal.destroy()
      },
      onOk: () => {
        const fileName = `schema-${currentSchema.collectionName}-${random(8)}.json`
        const { fields, collectionName, displayName } = currentSchema
        saveContentToFile(JSON.stringify([{ fields, collectionName, displayName }]), fileName)
        message.success('原型导出成功！')
      },
    })
  }, [currentSchema])

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
                    style={iconStyle}
                    onClick={() => {
                      onSchemaChange('edit', true)
                    }}
                  />
                  <DeleteTwoTone style={iconStyle} onClick={() => setDeleteSchmeaVisible(true)} />
                  <ExportOutlined
                    style={{ ...iconStyle, color: '#0052d9' }}
                    onClick={exportSchema}
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
