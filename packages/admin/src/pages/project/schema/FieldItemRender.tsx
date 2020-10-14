import React, { useState } from 'react'
import { FieldTypes } from '@/common'
import { Card, Space, Typography, Tooltip, Switch, Popover, Tag, Spin } from 'antd'
import { ExclamationCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { updateSchema } from '@/services/schema'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { SchmeaCtx } from 'typings/store'

export interface FieldType {
  icon: React.ReactNode
  name: string
  type: string
}

const { Paragraph, Text, Title } = Typography

export const SchemaFieldRender: React.FC<{
  schema: SchemaV2
  onFiledClick: (filed: SchemaFieldV2) => void
  actionRender: (field: SchemaFieldV2) => React.ReactNode
}> = (props) => {
  const { schema, actionRender, onFiledClick } = props
  const [sortLoading, setSortLoading] = useState(false)
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, SchmeaCtx>('schema')

  const { loading } = ctx.state

  const handleDragSort = async (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const source = result.source.index
    const destination = result.destination.index

    // 未改变顺序
    if (source === destination) {
      return
    }

    // 获取字段排序后的列表
    let resortedFields = schema?.fields
      ?.filter((_) => _)
      .sort((prev, next) => prev.order - next.order)

    // 将被移动的字段移到对应的位置
    const moveField = resortedFields.splice(source, 1)?.[0]
    resortedFields.splice(destination, 0, moveField)

    // 重置 order 值
    resortedFields = resortedFields.map((field, index) => ({
      ...field,
      order: index,
    }))

    // 更新顺序
    schema.fields = resortedFields
    setSortLoading(true)
    await updateSchema(projectId, schema?._id, {
      fields: resortedFields,
    })
    ctx.mr.getSchemas(projectId)
    setSortLoading(false)
  }

  return (
    <div>
      <SystemField />
      <Spin tip="加载中" spinning={loading || sortLoading}>
        <DragDropContext onDragEnd={handleDragSort}>
          <Droppable droppableId="droppable">
            {(droppableProvided) => (
              <div ref={droppableProvided.innerRef}>
                {schema?.fields
                  ?.filter((_) => _)
                  .sort((prev, next) => prev.order - next.order)
                  .map((field, index) => {
                    const type = FieldTypes.find((_) => _.type === field.type)

                    return (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(draggableProvided) => (
                          <div
                            className="schema-field-card"
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                          >
                            <Card hoverable key={index} onClick={() => onFiledClick(field)}>
                              <Space style={{ flex: '1 1 auto' }}>
                                <div className="icon">{type?.icon}</div>
                                <div className="flex-column">
                                  <Space align="center" style={{ marginBottom: '10px' }}>
                                    <Tooltip title={field.displayName}>
                                      <Title ellipsis level={4} style={{ marginBottom: 0 }}>
                                        {field.displayName}
                                      </Title>
                                    </Tooltip>
                                    <Text strong># {field.name}</Text>
                                    {field.description && (
                                      <Tooltip title={field.description}>
                                        <ExclamationCircleTwoTone style={{ fontSize: '16px' }} />
                                      </Tooltip>
                                    )}
                                  </Space>
                                  <Space>
                                    <Tag>{type?.name}</Tag>
                                  </Space>
                                </div>
                              </Space>
                              {actionRender(field)}
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                {droppableProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Spin>
    </div>
  )
}

const SYSTEM_FIELDS = [
  {
    displayName: '创建时间',
    id: '_createTime',
    name: '_createTime',
    order: 0,
    type: 'DateTime',
    description: '系统字段，不可修改',
  },
  {
    displayName: '修改时间',
    id: '_updateTime',
    name: '_updateTime',
    order: 0,
    type: 'DateTime',
    description: '系统字段，不可修改',
  },
]

export const SystemField: React.FC = () => {
  const [showSystemField, setShowSystemField] = useState(false)

  return (
    <div>
      <Paragraph>
        <Space>
          <Switch checked={showSystemField} onChange={(v) => setShowSystemField(v)} />
          <span>展示系统字段</span>
          <Popover content="系统字段为系统自动创建的字段，不可修改">
            <QuestionCircleTwoTone />
          </Popover>
        </Space>
      </Paragraph>
      {showSystemField
        ? SYSTEM_FIELDS.map((field, index) => {
            const type = FieldTypes.find((_) => _.type === field.type)
            return (
              <Card hoverable key={index} className="schema-field-card system-field">
                <Space style={{ flex: '1 1 auto' }}>
                  <div className="icon">{type?.icon}</div>
                  <div className="flex-column">
                    <Space align="center" style={{ marginBottom: '10px' }}>
                      <Tooltip title={field.displayName}>
                        <Title ellipsis level={4} style={{ marginBottom: 0 }}>
                          {field.displayName}
                        </Title>
                      </Tooltip>
                      <Text strong># {field.name}</Text>
                      {field.description && (
                        <Tooltip title={field.description}>
                          <ExclamationCircleTwoTone style={{ fontSize: '16px' }} />
                        </Tooltip>
                      )}
                    </Space>
                    <Space>
                      <Tag color="#9da6c7">{type?.name}</Tag>
                      <Tag color="#2575e6">系统字段</Tag>
                    </Space>
                  </div>
                </Space>
              </Card>
            )
          })
        : ''}
    </div>
  )
}
