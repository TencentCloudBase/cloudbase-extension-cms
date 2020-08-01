import { t } from '@/locales'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import React, { useState, useEffect } from 'react'
import { PlusCircleTwoTone } from '@ant-design/icons'
import { Card, Layout, Menu, List, Typography, Row, Col, Spin, Button, message, Empty } from 'antd'
import { FieldTypes } from '@/common'

import { SchemaFieldRender } from './FieldRender'
import { FieldModal } from './FieldModal'
import { SchemaModal } from './SchemaModal'
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
        state: { currentSchema, schemas, loading }
    }: { state: SchemaState } = ctx

    const [schemaVisible, setSchemaVisible] = useState(false)
    const [fieldVisible, setFieldVisible] = useState(false)
    const [selectField, setSelectField] = useState<any>(null)

    useEffect(() => {
        ctx.dispatch('getSchemas', projectId)
    }, [])

    const defaultSelectedMenu = currentSchema ? [currentSchema._id] : []

    return (
        <div className="page-container">
            <ProCard split="vertical" gutter={[16, 16]}>
                <ProCard
                    colSpan="240px"
                    className="card-left"
                    style={{ marginBottom: 0 }}
                    title={<h2 className="full-height">{t('schema.name')}</h2>}
                    extra={
                        <h2 className="full-height">
                            <PlusCircleTwoTone
                                style={{ fontSize: '20px' }}
                                onClick={() => setSchemaVisible(true)}
                            />
                        </h2>
                    }
                >
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
                                console.log('set')
                                ctx.setState({
                                    currentSchema: schema
                                })
                            }}
                        >
                            {schemas.map((item: SchemaV2) => (
                                <Menu.Item key={item._id}>{item.displayName}</Menu.Item>
                            ))}
                        </Menu>
                    ) : (
                        <Row justify="center">
                            <Col>原型为空</Col>
                        </Row>
                    )}
                </ProCard>
                <Layout className="schema-layout">
                    <Content className="full-height schema-layout-content">
                        {currentSchema ? (
                            <Row>
                                <Col flex="auto" />
                                <Col flex="600px">
                                    <div className="schema-layout-header">
                                        <Typography.Title level={3}>
                                            {currentSchema.displayName}
                                        </Typography.Title>
                                    </div>
                                    <Content>
                                        {currentSchema?.fields?.length ? (
                                            <SchemaFieldRender schema={currentSchema} />
                                        ) : (
                                            <div className="schema-empty">
                                                <Empty description="点击右侧字段类型，添加一个字段" />
                                            </div>
                                        )}
                                    </Content>
                                </Col>
                                <Col flex="auto" />
                            </Row>
                        ) : (
                            <div className="schema-empty">
                                <Empty description="创建你的原型，开始使用 CMS">
                                    <Button type="primary" onClick={() => setSchemaVisible(true)}>
                                        创建原型
                                    </Button>
                                </Empty>
                            </div>
                        )}
                    </Content>
                    <Sider className="schema-sider">
                        <List
                            bordered={false}
                            dataSource={FieldTypes}
                            renderItem={(item) => (
                                <Card
                                    className="field-card"
                                    onClick={() => {
                                        if (!currentSchema) {
                                            message.info('请选择原型')
                                            return
                                        }
                                        setSelectField(item)
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

            <SchemaModal visible={schemaVisible} onClose={() => setSchemaVisible(false)} />
            <FieldModal
                field={selectField}
                visible={fieldVisible}
                onClose={() => setFieldVisible(false)}
            />
        </div>
    )
}
