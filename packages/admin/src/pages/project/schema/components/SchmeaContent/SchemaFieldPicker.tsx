import React from 'react'
import { useConcent } from 'concent'
import { Card, Layout, List, message, Typography } from 'antd'
import { FieldTypes } from '@/common'
import { SchmeaCtx } from 'typings/store'

const { Sider } = Layout

export interface TableListItem {
  key: number
  name: string
  status: string
  updatedAt: number
  createdAt: number
  progress: number
  money: number
}

const SchemaFieldPicker: React.FC = () => {
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const {
    state: { currentSchema },
  } = ctx

  return (
    <Sider className="schema-sider" width="220">
      <Typography.Title level={3} className="schema-sider-header">
        内容类型
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
                editFieldVisible: true,
              })
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
  )
}

export default SchemaFieldPicker
