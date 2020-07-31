import { useParams } from 'umi'
import { useConcent } from 'concent'
import React, { useEffect, useRef } from 'react'
import { Menu, Button, Spin, Empty } from 'antd'
import ProCard from '@ant-design/pro-card'
import ProTable from '@ant-design/pro-table'
import { PlusOutlined } from '@ant-design/icons'
import { createColumns } from './columns'
import './index.less'
import { getContents } from '@/services/content'

export default (): React.ReactNode => {
    // 加载 schemas 数据
    const { projectId } = useParams()
    const ctx = useConcent('schema')

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

    const columns = createColumns(currentSchema)

    return (
        <div className="page-container">
            <ProCard split="vertical" gutter={[16, 16]}>
                <ProCard
                    colSpan="240px"
                    className="card-left"
                    title={<h2 className="full-height">内容</h2>}
                >
                    {loading ? (
                        <Menu>
                            <Menu.Item>
                                <Spin />
                            </Menu.Item>
                        </Menu>
                    ) : schemas?.length ? (
                        <Menu
                            onClick={({ key }) => {
                                const schema = schemas.find((item: any) => item._id === key)
                                ctx.setState({
                                    currentSchema: schema
                                })
                                if (tableRef?.current) {
                                    tableRef.current?.reloadAndRest()
                                }
                            }}
                        >
                            {schemas.map((item: any) => (
                                <Menu.Item key={item._id}>
                                    {item.display_name || item.label}
                                </Menu.Item>
                            ))}
                        </Menu>
                    ) : (
                        '内容数据为空'
                    )}
                </ProCard>
                <ProCard>
                    {currentSchema ? (
                        <ProTable
                            headerTitle={
                                <span className="table-title">
                                    {currentSchema?.label || currentSchema?.display_name}
                                </span>
                            }
                            actionRef={tableRef}
                            columns={columns}
                            request={async (
                                params: { pageSize: number; current: number; [key: string]: any },
                                sort,
                                filter
                            ) => {
                                const { pageSize, current } = params
                                const resource =
                                    currentSchema.collectionName || currentSchema.collection_name
                                const { data = [], total } = await getContents(resource, {
                                    page: current,
                                    pageSize,
                                    sort,
                                    filter
                                })

                                console.log(data, total)

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
                                <Button type="primary" key="button" icon={<PlusOutlined />}>
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
        </div>
    )
}
