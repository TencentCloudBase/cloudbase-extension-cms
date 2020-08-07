import React, { useState } from 'react'
import {
    Card,
    Row,
    Col,
    Divider,
    List,
    Skeleton,
    Button,
    Tag,
    Space,
    Typography,
    message,
    Modal,
    Form,
    Input,
    Select
} from 'antd'
import { useRequest } from 'umi'
import { getUsers, createUser, deleteUser } from '@/services/user'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import { getSchemas } from '@/services/schema'
import { getProjects } from '@/services/project'

const RoleMap = {
    administrator: '管理员',
    operator: '运营人员',
    other: '其他人员'
}

const ActionMap = {
    get: '查询',
    update: '更新',
    delete: '删除',
    create: '创建'
}

export default (): React.ReactElement => {
    const [modalVisible, setModalVisible] = useState(false)
    const [reload, setReload] = useState(0)
    const { data, loading } = useRequest(() => getUsers(), {
        refreshDeps: [reload]
    })

    if (loading) {
        return <Skeleton active />
    }

    return (
        <>
            <Typography.Title level={4}>成员管理</Typography.Title>
            <Card>
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item: any) => (
                        <>
                            <Row align="middle">
                                <Col flex="1 1 auto">
                                    <Space direction="vertical">
                                        <Typography.Title level={4}>
                                            {item.username}
                                        </Typography.Title>
                                        <Tag color="#006eff">{RoleMap[item.role]}</Tag>
                                    </Space>
                                    {item.collections?.length && (
                                        <div style={{ marginTop: '10px' }}>
                                            数据集合：
                                            {item.collections?.map((_: string) => (
                                                <Tag key={_}>{_} </Tag>
                                            ))}
                                            | 操作权限：
                                            {item.actions?.map((_: string) => (
                                                <Tag key={_}>{ActionMap[_]} </Tag>
                                            ))}
                                        </div>
                                    )}
                                </Col>
                                <Col span={4}>
                                    <Button
                                        danger
                                        size="small"
                                        type="primary"
                                        onClick={() => {
                                            Modal.confirm({
                                                title: `确认删除 ${item.username} ？`,
                                                onOk: async () => {
                                                    await deleteUser(item._id)
                                                    setReload(reload + 1)
                                                }
                                            })
                                        }}
                                    >
                                        删除
                                    </Button>
                                </Col>
                            </Row>
                            <Divider style={{ margin: '15px 0' }} />
                        </>
                    )}
                />
                <Button type="primary" onClick={() => setModalVisible(true)}>
                    添加
                </Button>
            </Card>
            <CreateUserModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false)
                    setReload(reload + 1)
                }}
            />
        </>
    )
}

const CreateUserModal: React.FC<{
    visible: boolean
    onSuccess: () => void
    onClose: () => void
}> = ({ visible, onClose, onSuccess }) => {
    const [formValue, setFormValue] = useState<any>({})

    // 加载用户列表
    const { run, loading } = useRequest(
        async (data: any) => {
            await createUser(data)
            onSuccess()
        },
        {
            manual: true,
            onError: () => message.error('添加用户失败'),
            onSuccess: () => message.success('添加用户成功')
        }
    )

    // 加载项目
    const { data: projects = [], loading: projectLoading, run: loadProjects } = useRequest(
        () => getProjects(),
        {
            manual: true
        }
    )

    // 加载数据库集合
    const { data: schmeas = [], loading: schemaLoading, run: loadSchemas } = useRequest(
        (projectId: string) => getSchemas(projectId),
        {
            manual: true
        }
    )

    return (
        <Modal
            centered
            title="新建用户"
            footer={null}
            visible={visible}
            onOk={() => onClose()}
            onCancel={() => onClose()}
        >
            <Form
                layout="vertical"
                labelAlign="left"
                labelCol={{ span: 6 }}
                onFinish={(v = {}) => {
                    run(v)
                }}
                onValuesChange={(_: any, v: any) => {
                    setFormValue(v)

                    if (v.projectId) {
                        loadSchemas(v.projectId)
                    }
                    if (v.role === 'other') {
                        loadProjects()
                    }
                }}
            >
                <Form.Item
                    label="用户名"
                    name="username"
                    rules={[
                        { required: true, pattern: /^[a-zA-Z]{4,}$/, message: '用户名不符合规则！' }
                    ]}
                >
                    <Input placeholder="仅支持大小写字母，不能小于 4 位" />
                </Form.Item>

                <Form.Item
                    label="用户密码"
                    name="password"
                    rules={[{ required: true, message: '请输入项目描述！' }]}
                >
                    <Input.Password
                        placeholder="输入密码"
                        iconRender={(visible) =>
                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                    />
                </Form.Item>

                <Form.Item
                    label="用户角色"
                    name="role"
                    rules={[{ required: true, message: '请选择用户角色！' }]}
                >
                    <Select>
                        <Select.Option value="administrator">管理员</Select.Option>
                        <Select.Option value="operator">运营人员</Select.Option>
                        <Select.Option value="other">其他人员</Select.Option>
                    </Select>
                </Form.Item>

                {formValue?.role === 'other' && (
                    <>
                        <Form.Item
                            label="项目"
                            name="projectId"
                            rules={[{ required: true, message: '请选择用户角色！' }]}
                        >
                            <Select loading={projectLoading}>
                                {projects?.map((project: any) => (
                                    <Select.Option key={project._id} value={project._id}>
                                        {project.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="内容集合"
                            name="collections"
                            rules={[{ required: true, message: '请选择内容集合！' }]}
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
                            label="操作权限"
                            name="actions"
                            rules={[{ required: true, message: '请选择操作权限！' }]}
                        >
                            <Select mode="multiple">
                                <Select.Option value="get">查询内容</Select.Option>
                                <Select.Option value="create">创建内容</Select.Option>
                                <Select.Option value="update">修改内容</Select.Option>
                                <Select.Option value="delete">删除内容</Select.Option>
                            </Select>
                        </Form.Item>
                    </>
                )}

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
