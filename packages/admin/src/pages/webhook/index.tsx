import React, { useRef, useState } from 'react'
import {
    Typography,
    Button,
    Modal,
    Space,
    Tag,
    Tabs,
    Row,
    Col,
    message,
    Form,
    Input,
    Select,
    Checkbox
} from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { useParams, useRequest } from 'umi'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { getWebhooks, createWebhook } from '@/services/webhook'
import { getSchemas } from '@/services/schema'

const { TabPane } = Tabs

interface Webhook {
    name: string
    url: string
    method: string
    event: string[]
    collections: string[]
    triggerType: string | 'all'
    headers: { [key: string]: string }[]
}

const EventMap = {
    create: '创建内容',
    delete: '删除内容',
    update: '更新内容',
    updateMany: '更新内容[批量]',
    deleteMany: '删除内容[批量]'
}

const WebhookColumns: ProColumns<Webhook>[] = [
    {
        title: 'Webhook 名称',
        dataIndex: 'name',
        width: 200
    },
    {
        title: '触发路径',
        dataIndex: 'url',
        render: (_, row) => (
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: true
                }}
            >
                {row.url}
            </Typography.Paragraph>
        )
    },
    {
        title: '触发类型',
        dataIndex: 'triggerType',
        valueType: 'textarea',

        render: (_, row) => {
            if (row.triggerType === 'all') {
                return '全部'
            }

            if (row.triggerType === 'filter') {
                return (
                    <Row gutter={[12, 12]}>
                        {row.event
                            .map((_) => EventMap[_])
                            .map((_, index) => (
                                <Col
                                    key={index}
                                    xs={{ span: 24 }}
                                    sm={{ span: 12 }}
                                    lg={{ span: 12 }}
                                    xl={{ span: 8 }}
                                >
                                    <Tag>{_}</Tag>
                                </Col>
                            ))}
                    </Row>
                )
            }

            return row.event.map((_) => EventMap[_]).join(' ')
        }
    },
    {
        title: '监听内容',
        dataIndex: 'collections',
        render: (_, row) => (
            <Space>
                {row.collections.map((_, index) => (
                    <Typography.Paragraph
                        key={index}
                        ellipsis={{
                            rows: 1,
                            expandable: true
                        }}
                    >
                        {_}
                    </Typography.Paragraph>
                ))}
            </Space>
        )
    },
    {
        title: 'HTTP 方法',
        dataIndex: 'method',
        width: 100,
        valueEnum: {
            GET: 'GET',
            POST: 'POST',
            UPDATE: 'UPDATE',
            DELETE: 'DELETE'
        }
    }
]

const columns: ProColumns<Webhook>[] = WebhookColumns.map((item) => ({
    ...item,
    align: 'center'
}))

export default (): React.ReactNode => {
    const params = useParams()
    const tableRef = useRef<{
        reload: (resetPageIndex?: boolean) => void
        reloadAndRest: () => void
        fetchMore: () => void
        reset: () => void
        clearSelected: () => void
    }>()
    const [modalVisible, setModalVisible] = useState(false)

    const tableRequest = async (
        params: { pageSize: number; current: number; [key: string]: any },
        sort: {
            [key: string]: 'ascend' | 'descend'
        },
        filter: {
            [key: string]: React.ReactText[]
        }
    ) => {
        const { current, pageSize } = params

        const { data = [], total } = await getWebhooks({
            sort,
            filter,
            pageSize,
            page: current
        })

        return {
            data,
            total,
            success: true
        }
    }

    return (
        <PageContainer
            className="page-container"
            content="Webhook 可以用于在运营人员修改内容数据后，自动回调外部系统，比如自动构建静态网站、发送通知等"
        >
            <Tabs>
                <TabPane tab="Webhooks" key="webhooks">
                    <ProTable
                        rowKey="_id"
                        search={false}
                        defaultData={[]}
                        actionRef={tableRef}
                        dateFormatter="string"
                        scroll={{ x: 1200 }}
                        request={tableRequest}
                        pagination={{
                            showSizeChanger: true
                        }}
                        columns={[
                            ...columns,
                            {
                                title: '操作',
                                width: 200,
                                align: 'center',
                                fixed: 'right',
                                valueType: 'option',
                                render: (_: any, row: any): React.ReactNode => [
                                    <Button
                                        size="small"
                                        type="primary"
                                        key="edit"
                                        onClick={() => {}}
                                    >
                                        编辑
                                    </Button>,
                                    <Button
                                        danger
                                        size="small"
                                        type="primary"
                                        key="delete"
                                        onClick={() => {
                                            const modal = Modal.confirm({
                                                title: '确认删除此内容？',
                                                onCancel: () => {
                                                    modal.destroy()
                                                },
                                                onOk: async () => {}
                                            })
                                        }}
                                    >
                                        删除
                                    </Button>
                                ]
                            }
                        ]}
                        toolBarRender={() => [
                            <Button
                                type="primary"
                                key="button"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    // ctx.setState({
                                    //     contentAction: 'create',
                                    //     selectedContent: null
                                    // })
                                    setModalVisible(true)
                                }}
                            >
                                新建
                            </Button>
                        ]}
                    />
                </TabPane>
                <TabPane tab="执行日志" key="log">
                    Content of Tab Pane 2
                </TabPane>
            </Tabs>
            <CreateProjectModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false)
                    tableRef?.current?.reloadAndRest()
                }}
            />
        </PageContainer>
    )
}

export const CreateProjectModal: React.FC<{
    visible: boolean
    onSuccess: () => void
    onClose: () => void
}> = ({ visible, onClose, onSuccess }) => {
    const { projectId } = useParams()
    const [formValue, setFormValue] = useState<any>()
    const { run, loading } = useRequest(
        async (data: any) => {
            console.log(data)
            await createWebhook({
                payload: data
            })
            onSuccess()
        },
        {
            manual: true,
            onError: () => message.error('创建 Webhook 失败'),
            onSuccess: () => message.success('创建 Webhook 成功')
        }
    )

    // 加载数据库集合
    const { data: schmeas = [], loading: schemaLoading } = useRequest(() => getSchemas(projectId))

    const eventOptions = Object.keys(EventMap).map((key) => ({
        value: key,
        label: EventMap[key]
    }))

    return (
        <Modal
            centered
            width={700}
            title="创建 Webhook"
            footer={null}
            visible={visible}
            onOk={() => onClose()}
            onCancel={() => onClose()}
        >
            <Form
                name="basic"
                layout="vertical"
                labelCol={{ span: 6 }}
                labelAlign="left"
                onFinish={(v = {}) => {
                    v.events = v.triggerType ? [] : v.events
                    v.triggerType = v.triggerType ? 'all' : 'filter'
                    run(v)
                }}
                onValuesChange={(_, v) => {
                    console.log(v)
                    setFormValue(v)
                }}
            >
                <Form.Item
                    label="Webhook 名称"
                    name="name"
                    rules={[{ required: true, message: '请输入 Webhook 名称！' }]}
                >
                    <Input placeholder="Webhook 名称，如更新通知" />
                </Form.Item>

                <Form.Item label="Webhook 描述" name="description">
                    <Input placeholder="Webhook 描述，如数据更新通知" />
                </Form.Item>

                <Form.Item
                    label="触发 URL"
                    name="url"
                    rules={[{ required: true, message: '请输入 Webhook 触发 URL！' }]}
                >
                    <Input placeholder="Webhook 触发 URL，如 https://cloud.tencent.com" />
                </Form.Item>

                <Form.Item
                    label="监听内容"
                    name="collections"
                    rules={[{ required: true, message: '请选择监听内容！' }]}
                >
                    <Select mode="multiple" loading={schemaLoading}>
                        {schmeas?.map((schema: any) => (
                            <Select.Option key={schema._id} value={schema.collectionName}>
                                {schema.collectionName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="触发事件"
                    name="triggerType"
                    valuePropName="checked"
                    rules={[{ required: formValue?.triggerType, message: '请选择触发类型！' }]}
                >
                    <Checkbox>全部事件</Checkbox>
                </Form.Item>
                {!formValue?.triggerType && (
                    <Form.Item
                        name="event"
                        rules={[{ required: true, message: '请选择触发事件！' }]}
                    >
                        <Checkbox.Group options={eventOptions} />
                    </Form.Item>
                )}

                <Form.Item label="HTTP 方法" name="method">
                    <Select>
                        <Select.Option value="GET">GET</Select.Option>
                        <Select.Option value="POST">POST</Select.Option>
                        <Select.Option value="UPDATE">UPDATE</Select.Option>
                        <Select.Option value="DELETE">DELETE</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="HTTP Headers">
                    <Form.List name="headers">
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    {fields?.map((field, index) => {
                                        console.log(field)
                                        return (
                                            <Form.Item key={field.key}>
                                                <Form.Item
                                                    noStyle
                                                    name={[field.key, 'key']}
                                                    validateTrigger={['onChange', 'onBlur']}
                                                >
                                                    <Input
                                                        placeholder="Header Key"
                                                        style={{ width: '40%' }}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    noStyle
                                                    name={[field.key, 'value']}
                                                    validateTrigger={['onChange', 'onBlur']}
                                                >
                                                    <Input
                                                        placeholder="Header Value"
                                                        style={{ marginLeft: '5%', width: '40%' }}
                                                    />
                                                </Form.Item>
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    style={{ margin: '0 8px' }}
                                                    onClick={() => {
                                                        remove(field.name)
                                                    }}
                                                />
                                            </Form.Item>
                                        )
                                    })}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => {
                                                add()
                                            }}
                                            style={{ width: '60%' }}
                                        >
                                            <PlusOutlined /> 添加字段
                                        </Button>
                                    </Form.Item>
                                </div>
                            )
                        }}
                    </Form.List>
                </Form.Item>

                <Form.Item>
                    <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => onClose()}>取消</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            创建
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
