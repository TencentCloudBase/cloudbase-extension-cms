import React, { useState } from 'react'
import { PlusSquareTwoTone } from '@ant-design/icons'
import {
    Card,
    Typography,
    Layout,
    Row,
    Col,
    Skeleton,
    Modal,
    Form,
    Input,
    Space,
    Button,
    message
} from 'antd'
import { history, useRequest } from 'umi'
import AvatarDropdown from '@/components/AvatarDropdown'
import { getProjects, createProject } from '@/services/project'
import styles from './index.less'

const { Header, Content } = Layout

export default (): React.ReactNode => {
    const [modalVisible, setModalVisible] = useState(false)
    const [reload, setReload] = useState(0)
    const { data = [], loading } = useRequest(() => getProjects(), {
        refreshDeps: [reload]
    })

    if (loading) {
        return <Skeleton active />
    }

    return (
        <>
            <Layout className={styles.home}>
                <Header className={styles.header}>
                    <img className={styles.logo} src="/img/logo.png" alt="logo" />
                    <span className={styles.title}>CloudBase CMS</span>
                    <div className={styles.account}>
                        <AvatarDropdown />
                    </div>
                </Header>
                <Content className={styles.content}>
                    <Row>
                        <Col xs={{ offset: 2 }} md={{ offset: 4 }} lg={{ offset: 6 }} />
                        <Col flex="1 1 auto">
                            <Row gutter={[24, 40]}>
                                <Col>
                                    <Typography.Title level={3}>我的项目</Typography.Title>
                                </Col>
                            </Row>
                            <Row gutter={[64, 40]}>
                                {data.map((project, index) => (
                                    <Col flex="0 1 250px" key={index}>
                                        <Card
                                            hoverable
                                            onClick={() => {
                                                history.push(`/${project._id}/home`)
                                            }}
                                        >
                                            <div
                                                className={styles.project}
                                                onClick={() => {
                                                    history.push('/')
                                                }}
                                            >
                                                <div className={styles['project-logo']}>
                                                    {project.name.slice(0, 2)}
                                                </div>
                                                <Typography.Title
                                                    level={4}
                                                    className={styles['project-title']}
                                                >
                                                    {project.name}
                                                </Typography.Title>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <Row gutter={[0, 40]}>
                                <Col>
                                    <Typography.Title level={3}>新建项目</Typography.Title>
                                </Col>
                            </Row>
                            <Row gutter={[64, 40]}>
                                <Col flex="0 1 250px">
                                    <Card
                                        hoverable
                                        onClick={() => {
                                            setModalVisible(true)
                                        }}
                                    >
                                        <div className={styles.project} onClick={() => {}}>
                                            <PlusSquareTwoTone style={{ fontSize: '60px' }} />
                                            <Typography.Title
                                                level={4}
                                                className={styles['project-title']}
                                            >
                                                创建新项目
                                            </Typography.Title>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={{ offset: 2 }} md={{ offset: 4 }} lg={{ offset: 6 }} />
                    </Row>
                </Content>
            </Layout>
            <CreateProjectModal
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

export const CreateProjectModal: React.FC<{
    visible: boolean
    onSuccess: () => void
    onClose: () => void
}> = ({ visible, onClose, onSuccess }) => {
    const { run, loading } = useRequest(
        async (data: any) => {
            await createProject(data)
            onSuccess()
        },
        {
            manual: true,
            onError: () => message.error('创建项目失败'),
            onSuccess: () => message.success('创建项目成功')
        }
    )

    return (
        <Modal
            centered
            title="创建原型"
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
                    run(v)
                }}
            >
                <Form.Item
                    label="项目名称"
                    name="name"
                    rules={[{ required: true, message: '请输入项目名称！' }]}
                >
                    <Input placeholder="项目名称，如个人博客" />
                </Form.Item>

                <Form.Item
                    label="项目描述"
                    name="description"
                    rules={[{ required: true, message: '请输入项目描述！' }]}
                >
                    <Input placeholder="项目描述，如我的个人博客" />
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
