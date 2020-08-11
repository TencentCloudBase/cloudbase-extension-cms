import React, { useState } from 'react'
import { Button, Tag, Space, message, Modal, Form, Input, Select } from 'antd'
import { useRequest } from 'umi'
import ProList from '@ant-design/pro-list'
import { createUser, updateUser } from '@/services/user'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import { getProjects } from '@/services/project'
const dataSource = ['语雀的天空', 'Ant Design', '蚂蚁金服体验科技', 'TechUI']

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

    return (
        <>
            <ProList<string>
                actions={[
                    <Button
                        key="new"
                        size="small"
                        type="primary"
                        onClick={() => setModalVisible(true)}
                    >
                        新建
                    </Button>,
                ]}
                rowKey="id"
                dataSource={dataSource}
                renderItem={(item) => ({
                    title: item,
                    subTitle: <Tag color="#5BD8A6">语雀专栏</Tag>,
                    actions: [<a key="1">邀请</a>],
                    description: (
                        <div>
                            <div>一个 UI 设计体系</div>
                            <div>林外发布于 2019-06-25</div>
                        </div>
                    ),
                    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg',
                })}
            />
            <PolicyModal
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

const PolicyModal: React.FC<{
    visible: boolean
    action: 'create' | 'edit'
    selectedUser?: any
    onClose: () => void
    onSuccess: () => void
}> = ({ visible, onClose, onSuccess, action, selectedUser }) => {
    const { data: projects, loading: projectLoading } = useRequest(() => getProjects())

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
            onError: () => message.error(`${action === 'create' ? '添加' : '更新'}策略失败`),
            onSuccess: () => message.success(`${action === 'create' ? '添加' : '更新'}策略成功`),
        }
    )

    return (
        <Modal
            centered
            destroyOnClose
            width={900}
            footer={null}
            visible={visible}
            onOk={() => onClose()}
            onCancel={() => onClose()}
            title={action === 'create' ? '新建策略' : '编辑策略'}
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
                    label="策略名"
                    name="username"
                    rules={[
                        {
                            required: true,
                            pattern: /^[a-zA-Z]$/,
                            message: '策略名不符合规则！',
                        },
                    ]}
                >
                    <Input placeholder="仅支持大小写字母" />
                </Form.Item>
                <Form.Item
                    label="策略描述"
                    rules={[{ required: true, message: '请输入策略描述！' }]}
                >
                    <Input placeholder="描述此策略的信息" />
                </Form.Item>
                <Form.Item
                    label="策略定义"
                    name="definition"
                    rules={[{ required: true, message: '请选择策略角色！' }]}
                >
                    <Select loading={projectLoading}>
                        {projects?.map((project: any) => (
                            <Select.Option value={project._id} key={project._id}>
                                {project.name}
                            </Select.Option>
                        ))}
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
