import React from 'react'
import { useConcent } from 'concent'
import { Card, Layout, List, message, Typography } from 'antd'
import { FieldTypes } from '@/common'
import { SchmeaCtx } from 'typings/store'
import styled from 'styled-components'

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

const ListContainer = styled.div`
  overflow: auto;
  padding: 0 10px 0 10px;
  height: calc(100% - 100px);
`

const SchemaFieldPicker: React.FC = () => {
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const {
    state: { currentSchema },
  } = ctx

  return (
    <Sider className="schema-sider px-3" width="240">
      <Typography.Title level={3} className="pt-5 pb-4 pl-3">
        内容类型
      </Typography.Title>
      <ListContainer>
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
              <List.Item className="p-0">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </List.Item>
            </Card>
          )}
        />
      </ListContainer>
    </Sider>
  )
}

export default SchemaFieldPicker
