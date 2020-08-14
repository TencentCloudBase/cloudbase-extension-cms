import { useParams } from 'umi'
import { useConcent } from 'concent'
import React, { useEffect, useRef, useState } from 'react'
import ProCard from '@ant-design/pro-card'
import ProTable from '@ant-design/pro-table'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import { getContents, deleteContent } from '@/services/content'
import { Menu, Button, Spin, Empty, Row, Col, Modal, message } from 'antd'
import { createColumns } from './columns'
import { ContentDrawer } from './ContentDrawer'
import './index.less'

export default (): React.ReactNode => {
    // 加载 schemas 数据
    const { projectId } = useParams()
    const ctx = useConcent('content')
    const [contentModalVisible, setContentModalVisible] = useState(false)

    useEffect(() => {
        ctx.dispatch('getContentSchemas', projectId)
    }, [])

    const tableRef = useRef<{
        reload: (resetPageIndex?: boolean) => void
        reloadAndRest: () => void
        fetchMore: () => void
        reset: () => void
        clearSelected: () => void
    }>()

    const {
        state: { currentSchema, schemas, loading },
    }: { state: SchemaState } = ctx
    const columns = createColumns(currentSchema?.fields)
    const defaultSelectedMenu = currentSchema ? [currentSchema._id] : []

    return (
        <PageContainer className="page-container">
            <ProCard split="vertical" gutter={[16, 16]} style={{ background: 'inherit' }}>
                <ProCard colSpan="240px" className="card-left" style={{ marginBottom: 0 }}>
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
                                const schema = schemas.find((item: SchemaV2) => item._id === key)
                                ctx.setState({
                                    currentSchema: schema,
                                })
                                if (tableRef?.current) {
                                    tableRef.current?.reloadAndRest()
                                }
                            }}
                        >
                            {schemas.map((item: SchemaV2) => (
                                <Menu.Item key={item._id}>{item.displayName}</Menu.Item>
                            ))}
                        </Menu>
                    ) : (
                        <Row justify="center">
                            <Col>内容数据为空</Col>
                        </Row>
                    )}
                </ProCard>
                <ProCard style={{ marginBottom: 0, width: 'calc(100% - 256px)' }}>
                    {currentSchema ? (
                        <ProTable
                            search
                            rowKey="_id"
                            defaultData={[]}
                            actionRef={tableRef}
                            dateFormatter="string"
                            scroll={{ x: 1000 }}
                            headerTitle={
                                <span className="table-title">{currentSchema.displayName}</span>
                            }
                            columns={[
                                ...columns,
                                {
                                    title: '操作',
                                    width: 150,
                                    align: 'center',
                                    fixed: 'right',
                                    valueType: 'option',
                                    render: (text, row: any) => [
                                        <Button
                                            size="small"
                                            type="primary"
                                            key="edit"
                                            onClick={() => {
                                                ctx.setState({
                                                    contentAction: 'edit',
                                                    selectedContent: row,
                                                })
                                                setContentModalVisible(true)
                                            }}
                                        >
                                            编辑
                                        </Button>,
                                        <Button
                                            danger
                                            size="small"
                                            key="delete"
                                            type="primary"
                                            onClick={() => {
                                                const modal = Modal.confirm({
                                                    title: '确认删除此内容？',
                                                    onCancel: () => {
                                                        modal.destroy()
                                                    },
                                                    onOk: async () => {
                                                        try {
                                                            await deleteContent(
                                                                projectId,
                                                                currentSchema.collectionName,
                                                                row._id
                                                            )
                                                            tableRef?.current?.reloadAndRest()
                                                            message.success('删除内容成功')
                                                        } catch (error) {
                                                            message.error('删除内容失败')
                                                        }
                                                    },
                                                })
                                            }}
                                        >
                                            删除
                                        </Button>,
                                    ],
                                },
                            ]}
                            request={async (
                                params: { pageSize: number; current: number; [key: string]: any },
                                sort,
                                filter
                            ) => {
                                const { pageSize, current } = params
                                const resource = currentSchema.collectionName
                                // 从 params 中过滤出搜索字段
                                const fuzzyFilter = Object.keys(params)
                                    .filter((key) =>
                                        currentSchema.fields?.find((field) => field.name === key)
                                    )
                                    .reduce(
                                        (prev, key) => ({
                                            ...prev,
                                            [key]: params[key],
                                        }),
                                        {}
                                    )

                                const { data = [], total } = await getContents(
                                    projectId,
                                    resource,
                                    {
                                        sort,
                                        filter,
                                        pageSize,
                                        fuzzyFilter,
                                        page: current,
                                    }
                                )

                                return {
                                    data,
                                    total,
                                    success: true,
                                }
                            }}
                            pagination={{
                                showSizeChanger: true,
                            }}
                            toolBarRender={() => [
                                <Button
                                    type="primary"
                                    key="button"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        ctx.setState({
                                            contentAction: 'create',
                                            selectedContent: null,
                                        })
                                        setContentModalVisible(true)
                                    }}
                                >
                                    新建
                                </Button>,
                            ]}
                        />
                    ) : (
                        <div className="content-empty">
                            <Empty description="创建你的原型，开始使用 CMS">未选择内容</Empty>
                        </div>
                    )}
                </ProCard>
            </ProCard>
            <ContentDrawer
                schema={currentSchema}
                visible={contentModalVisible}
                onClose={() => setContentModalVisible(false)}
                onOk={() => {
                    setContentModalVisible(false)
                    tableRef?.current?.reload()
                }}
            />
        </PageContainer>
    )
}
