import React from 'react'
import { useConcent } from 'concent'
import { Menu, Row, Col, Spin } from 'antd'
import { CtxM } from 'typings/store'

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

const SchemaList: React.FC = () => {
  const ctx = useConcent<{}, Ctx>('schema')
  const {
    state: { currentSchema, schemas, loading },
  } = ctx

  const defaultSelectedMenu = currentSchema?._id ? [currentSchema._id] : []

  return loading ? (
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
  )
}

export default SchemaList
