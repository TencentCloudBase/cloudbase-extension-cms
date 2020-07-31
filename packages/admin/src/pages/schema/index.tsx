import { t } from '@/locales'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import React, { useState, useEffect } from 'react'
import { PlusCircleTwoTone } from '@ant-design/icons'
import { Card, Layout, Menu, List, Typography, Row, Col, Spin, Button, message, Empty } from 'antd'
import ProCard from '@ant-design/pro-card'

import { SchemaV1FieldRender, SchemaV2FieldRender } from './FieldRender'
import { FieldModal } from './FieldModal'
import { SchemaModal } from './SchemaModal'
import { FieldTypes } from '@/common'
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
                        <Menu>
                            <Menu.Item>
                                <Spin />
                            </Menu.Item>
                        </Menu>
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
                            {schemas.map((item: any) => (
                                <Menu.Item key={item._id}>
                                    {item.display_name || item.label}
                                </Menu.Item>
                            ))}
                        </Menu>
                    ) : (
                        '原型为空'
                    )}
                </ProCard>
                <ProCard>
                    <Layout>
                        <Content className="schema-content">
                            {currentSchema ? (
                                <Row>
                                    <Col flex="auto" />
                                    <Col flex="600px">
                                        <div className="schema-content-header">
                                            <Typography.Title level={3}>
                                                {currentSchema?.display_name ||
                                                    currentSchema?.label}
                                            </Typography.Title>
                                        </div>
                                        <Content>
                                            {currentSchema?.fields?.length ? (
                                                // <FieldRender schema={currentSchema} />
                                                projectId === 'v1' ? (
                                                    <SchemaV1FieldRender schema={currentSchema} />
                                                ) : (
                                                    <SchemaV2FieldRender schema={currentSchema} />
                                                )
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
                                        <Button
                                            type="primary"
                                            onClick={() => setSchemaVisible(true)}
                                        >
                                            创建原型
                                        </Button>
                                    </Empty>
                                </div>
                            )}
                        </Content>
                        <Sider width={200} className="schema-type-sider">
                            <List
                                bordered={false}
                                dataSource={FieldTypes.filter((_) => !_.hidden)}
                                renderItem={(item) => (
                                    <Card
                                        className="card"
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
