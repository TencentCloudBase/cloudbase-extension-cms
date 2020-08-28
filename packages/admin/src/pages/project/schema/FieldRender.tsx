import React from 'react'
import { FieldTypes } from '@/common'
import { ExclamationCircleTwoTone } from '@ant-design/icons'
import { Card, Space, Typography, Button, Tooltip } from 'antd'

export interface FieldType {
  icon: React.ReactNode
  name: string
  type: string
}

export const SchemaFieldRender: React.SFC<{
  schema: SchemaV2
  onFiledClick: (filed: SchemaFieldV2) => void
  actionRender: (field: SchemaFieldV2) => React.ReactNode
}> = (props) => {
  const { schema, actionRender, onFiledClick } = props

  return (
    <div>
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
                      <Typography.Title ellipsis level={4} style={{ marginBottom: 0 }}>
                        {field.displayName}
                      </Typography.Title>
                    </Tooltip>
                    <Typography.Text strong># {field.name}</Typography.Text>
                    {field.description && (
                      <Tooltip title={field.description}>
                        <ExclamationCircleTwoTone style={{ fontSize: '16px' }} />
                      </Tooltip>
                    )}
                  </Space>
                  <Space>
                    <Button size="small">{type?.name}</Button>
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
