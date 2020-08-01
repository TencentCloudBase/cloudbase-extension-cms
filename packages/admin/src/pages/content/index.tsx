import { useParams } from 'umi'
import { useConcent } from 'concent'
import React, { useEffect, useRef, useState } from 'react'
import ProCard from '@ant-design/pro-card'
import ProTable from '@ant-design/pro-table'
import { PlusOutlined } from '@ant-design/icons'
import { getContents } from '@/services/content'
import { Menu, Button, Spin, Empty, Row, Col } from 'antd'
import { createColumns } from './columns'
import { ContentDrawer } from './ContentDrawer'
import './index.less'

export default (): React.ReactNode => {
    // 加载 schemas 数据
    const { projectId } = useParams()
    const ctx = useConcent('schema')
    const [contentModalVisible, setContentModalVisible] = useState(false)

    useEffect(() => {
        ctx.dispatch('getSchemas', projectId)
    }, [])
    const tableRef = useRef<{
        reload: (resetPageIndex?: boolean) => void
        reloadAndRest: () => void
        fetchMore: () => void
        reset: () => void
        clearSelected: () => void
    }>()

    const {
        state: { currentSchema, schemas, loading }
    }: { state: SchemaState } = ctx

    const columns = createColumns(currentSchema?.fields)

    return (
        <div className="page-container">
            <ProCard split="vertical" gutter={[16, 16]}>
                <ProCard
                    colSpan="240px"
                    className="card-left"
                    title={<h2 className="full-height">内容</h2>}
                    style={{ marginBottom: 0 }}
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
                            onClick={({ key }) => {
                                const schema = schemas.find((item: SchemaV2) => item._id === key)
                                ctx.setState({
                                    currentSchema: schema
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
                <ProCard style={{ marginBottom: 0 }}>
                    {currentSchema ? (
                        <ProTable
                            headerTitle={
                                <span className="table-title">{currentSchema.displayName}</span>
                            }
                            actionRef={tableRef}
                            columns={columns}
                            request={async (
                                params: { pageSize: number; current: number; [key: string]: any },
                                sort,
                                filter
                            ) => {
                                const { pageSize, current } = params
                                const resource = currentSchema.collectionName
                                const { data = [], total } = await getContents(resource, {
                                    page: current,
                                    pageSize,
                                    sort,
                                    filter
                                })

                                return {
                                    data,
                                    total,
                                    success: true
                                }
                            }}
                            options={{
                                search: {
                                    name: 'keyWord'
                                }
                            }}
                            rowKey="key"
                            pagination={{
                                showSizeChanger: true
                            }}
                            size="middle"
                            search={false}
                            toolBarRender={() => [
                                <Button
                                    type="primary"
                                    key="button"
                                    icon={<PlusOutlined />}
                                    onClick={() => setContentModalVisible(true)}
                                >
                                    新建
                                </Button>
                            ]}
                            dateFormatter="string"
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
            />
        </div>
    )
}
