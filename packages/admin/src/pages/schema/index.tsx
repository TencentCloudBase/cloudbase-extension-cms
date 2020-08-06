import { t } from '@/locales'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import ProCard from '@ant-design/pro-card'
import React, { useState, useEffect } from 'react'
import { PlusCircleTwoTone, EditOutlined } from '@ant-design/icons'
import {
    Card,
    Layout,
    Menu,
    List,
    Row,
    Col,
    Spin,
    Button,
    message,
    Empty,
    Space,
    Popover,
    Typography
} from 'antd'
import { FieldTypes } from '@/common'

import { SchemaFieldRender } from './FieldRender'
import { CreateFieldModal, DeleteFieldModal } from './FieldModal'
import { CreateSchemaModal, DeleteSchemaModal } from './SchemaModal'
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

    const [createSchemaVisible, setCreateSchemaVisible] = useState(false)
    const [deleteSchemaVisible, setDeleteSchmeaVisible] = useState(false)
    const [fieldVisible, setFieldVisible] = useState(false)
    const [deleteFieldVisible, setDeleteFieldVisible] = useState(false)

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
                                onClick={() => setCreateSchemaVisible(true)}
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
                                    <Space className="schema-layout-header">
                                        <Typography.Title level={3}>
                                            {currentSchema.displayName}
                                        </Typography.Title>
                                        <Popover
                                            placement="bottom"
                                            content={
                                                <Space>
                                                    <Button
                                                        danger
                                                        size="small"
                                                        onClick={() => setDeleteSchmeaVisible(true)}
                                                    >
                                                        删除
                                                    </Button>
                                                </Space>
                                            }
                                        >
                                            <EditOutlined
                                                style={{
                                                    fontSize: '18px'
                                                }}
                                                onClick={() => {}}
                                            />
                                        </Popover>
                                    </Space>
                                    <Content>
                                        {currentSchema?.fields?.length ? (
                                            <SchemaFieldRender
                                                schema={currentSchema}
                                                actionRender={(field) => (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            type="primary"
                                                            onClick={() => {
                                                                ctx.setState({
                                                                    fieldAction: 'edit',
                                                                    selectedField: field
                                                                })
                                                                setFieldVisible(true)
                                                            }}
                                                        >
                                                            编辑
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            danger
                                                            onClick={() => {
                                                                ctx.setState({
                                                                    selectedField: field
                                                                })
                                                                setDeleteFieldVisible(true)
                                                            }}
                                                        >
                                                            删除
                                                        </Button>
                                                    </>
                                                )}
                                            />
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
                                        onClick={() => setCreateSchemaVisible(true)}
                                    >
                                        创建原型
                                    </Button>
                                </Empty>
                            </div>
                        )}
                    </Content>
                    <Sider className="schema-sider">
                        <Typography.Title level={3} className="schema-sider-header">
                            原型类型
                        </Typography.Title>
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
                                        ctx.setState({
                                            fieldAction: 'create',
                                            selectedField: item
                                        })
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

            <CreateSchemaModal
                visible={createSchemaVisible}
                onClose={() => setCreateSchemaVisible(false)}
            />
            <DeleteSchemaModal
                visible={deleteSchemaVisible}
                onClose={() => setDeleteSchmeaVisible(false)}
            />
            <CreateFieldModal visible={fieldVisible} onClose={() => setFieldVisible(false)} />
            <DeleteFieldModal
                visible={deleteFieldVisible}
                onClose={() => setDeleteFieldVisible(false)}
            />
        </div>
    )
}
