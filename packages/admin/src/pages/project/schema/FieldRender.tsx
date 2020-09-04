import React, { useState } from 'react'
import { FieldTypes } from '@/common'
import { ExclamationCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons'
import { Card, Space, Typography, Tooltip, Switch, Popover, Tag } from 'antd'

export interface FieldType {
  icon: React.ReactNode
  name: string
  type: string
}

const { Paragraph, Text, Title } = Typography

export const SchemaFieldRender: React.SFC<{
  schema: SchemaV2
  onFiledClick: (filed: SchemaFieldV2) => void
  actionRender: (field: SchemaFieldV2) => React.ReactNode
}> = (props) => {
  const { schema, actionRender, onFiledClick } = props

  return (
    <div>
      <SystemField />
      {schema?.fields
        ?.filter((_) => _)
        .sort((prev, next) => prev.order - next.order)
        .map((field, index) => {
          const type = FieldTypes.find((_) => _.type === field.type)
          return (
            <Card
              hoverable
              key={index}
              className="schema-field-card"
              onClick={() => onFiledClick(field)}
            >
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
          )
        })}
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
