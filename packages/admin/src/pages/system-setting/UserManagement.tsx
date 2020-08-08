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
    message,
    Modal,
    Form,
    Input,
    Typography,
    Select,
} from 'antd'
import { useRequest } from 'umi'
import { getUsers, createUser, deleteUser, updateUser } from '@/services/user'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'

const RoleMap = {
    administrator: '管理员',
    operator: '内容管理员',
    other: '自定义',
}

const ActionMap = {
    get: '查询',
    update: '更新',
    delete: '删除',
    create: '创建',
}

export default (): React.ReactElement => {
    const [reload, setReload] = useState(0)
    const [selectedUser, setSelectedUser] = useState()
    const [userAction, setUserAction] = useState<'create' | 'edit'>('create')
    const [modalVisible, setModalVisible] = useState(false)
    const { data, loading } = useRequest(() => getUsers(), {
        refreshDeps: [reload],
    })

    if (loading) {
        return <Skeleton active />
    }

    return (
        <>
            <Typography.Title level={4}>用户管理</Typography.Title>
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
                                    <Space>
                                        <Button
                                            size="small"
                                            type="primary"
                                            onClick={() => {
                                                setUserAction('edit')
                                                console.log(item)
                                                setSelectedUser(item)
                                                setModalVisible(true)
                                            }}
                                        >
                                            编辑
                                        </Button>
                                        <Button
                                            danger
                                            size="small"
                                            type="primary"
                                            onClick={() => {
                                                Modal.confirm({
                                                    okText: '确认',
                                                    cancelText: '取消',
                                                    title: `确认删除 ${item.username} ？`,
                                                    onOk: async () => {
                                                        await deleteUser(item._id)
                                                        setReload(reload + 1)
                                                    },
                                                })
                                            }}
                                        >
                                            删除
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                            <Divider style={{ margin: '15px 0' }} />
                        </>
                    )}
                />
                <Button
                    type="primary"
                    onClick={() => {
                        setUserAction('create')
                        setSelectedUser(undefined)
                        setModalVisible(true)
                    }}
                >
                    添加
                </Button>
            </Card>
            <CreateUserModal
                visible={modalVisible}
                action={userAction}
                selectedUser={selectedUser}
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
    action: 'create' | 'edit'
    selectedUser?: any
    onClose: () => void
    onSuccess: () => void
}> = ({ visible, onClose, onSuccess, action, selectedUser }) => {
    // 加载用户列表
    const { run, loading } = useRequest(
        async (data: any) => {
            if (action === 'create') {
                await createUser(data)
            }

            if (action === 'edit') {
                const diffData = Object.keys(selectedUser)
                    .filter((key) => selectedUser[key] !== data[key])
                    .reduce(
                        (ret, key) => ({
                            ...ret,
                            [key]: data[key],
                        }),
                        {}
                    )
                console.log(diffData)
                await updateUser(selectedUser._id, diffData)
            }
            onSuccess()
        },
        {
            manual: true,
            onError: () => message.error(`${action === 'create' ? '添加' : '更新'}用户失败`),
            onSuccess: () => message.success(`${action === 'create' ? '添加' : '更新'}用户成功`),
        }
    )

    return (
        <Modal
            centered
            destroyOnClose
            footer={null}
            visible={visible}
            onOk={() => onClose()}
            onCancel={() => onClose()}
            title={action === 'create' ? '新建用户' : '编辑用户'}
        >
            <Form
                layout="vertical"
                labelAlign="left"
                labelCol={{ span: 6 }}
                initialValues={selectedUser}
                onFinish={(v = {}) => {
                    run(v)
                }}
            >
                <Form.Item
                    label="用户名"
                    name="username"
                    rules={[
                        {
                            required: true,
                            pattern: /^[a-zA-Z]{4,}$/,
                            message: '用户名不符合规则！',
                        },
                    ]}
                >
                    <Input placeholder="仅支持大小写字母，不能小于 4 位" />
                </Form.Item>
                <Form.Item
                    label="用户密码"
                    name="password"
                    rules={[{ required: true, message: '请输入项目介绍！' }]}
                >
                    <Input.Password
                        placeholder="输入密码"
                        visibilityToggle={action === 'create'}
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
                        <Select.Option value="administrator">
                            系统管理员 - 系统全部权限【系统】
                        </Select.Option>
                        <Select.Option value="operator">
                            内容管理员 - 全部内容管理权限【系统】
                        </Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => onClose()}>取消</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {`${action === 'create' ? '新建' : '更新'}`}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
