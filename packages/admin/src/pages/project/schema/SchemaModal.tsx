import React, { useState } from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { createSchema, deleteSchema } from '@/services/schema'
import { Modal, Form, message, Input, Space, Button, Checkbox, Typography } from 'antd'

const { TextArea } = Input

export const CreateSchemaModal: React.FC<{
    visible: boolean
    onClose: () => void
}> = ({ visible, onClose }) => {
    const { projectId } = useParams()
    const ctx = useConcent('schema')

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
                    const { displayName, collectionName } = v
                    createSchema({
                        projectId,
                        displayName,
                        collectionName,
                    })
                        .then(() => {
                            onClose()
                            message.success('创建原型成功')
                            ctx.dispatch('getSchemas', projectId)
                        })
                        .catch(() => {
                            message.error('创建原型失败')
                        })
                }}
            >
                <Form.Item
                    label="展示名称"
                    name="displayName"
                    rules={[{ required: true, message: '请输入展示名称！' }]}
                >
                    <Input placeholder="展示名称，如文章" />
                </Form.Item>

                <Form.Item
                    label="数据库名"
                    name="collectionName"
                    rules={[
                        { required: true, message: '请输入数据库名称！' },
                        {
                            message: '字段名只能使用英文字母、数字、-、_ 等符号',
                            pattern: /^[a-z0-9A-Z_-]+$/,
                        },
                    ]}
                >
                    <Input placeholder="数据库名，如 article" />
                </Form.Item>

                <Form.Item label="描述" name="description">
                    <TextArea placeholder="原型描述，如博客文章" />
                </Form.Item>
                <Form.Item>
                    <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => onClose()}>取消</Button>
                        <Button type="primary" htmlType="submit">
                            创建
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export const DeleteSchemaModal: React.FC<{
    visible: boolean
    onClose: () => void
}> = ({ visible, onClose }) => {
    const { projectId } = useParams()
    const ctx = useConcent('schema')
    const { currentSchema = {} } = ctx.state
    const [deleteCollection, setDeleteCollection] = useState(false)

    return (
        <Modal
            centered
            destroyOnClose
            title="删除内容原型"
            visible={visible}
            onCancel={() => onClose()}
            onOk={() => {
                deleteSchema(currentSchema._id, deleteCollection)
                    .then(() => {
                        message.success('删除内容原型成功！')
                        ctx.dispatch('getSchemas', projectId)
                    })
                    .catch(() => {
                        message.error('删除内容原型失败！')
                    })
                    .finally(() => {
                        onClose()
                    })
            }}
        >
            <Space direction="vertical">
                <Typography.Text>确认删【{currentSchema?.displayName}】内容原型？</Typography.Text>
                <Checkbox
                    checked={deleteCollection}
                    onChange={(e) => setDeleteCollection(e.target.checked)}
                >
                    同时删除数据表（警告：删除后数据无法找回）
                </Checkbox>
            </Space>
        </Modal>
    )
}
