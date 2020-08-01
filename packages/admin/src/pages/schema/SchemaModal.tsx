import React from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { createSchema } from '@/services/schema'
import { Modal, Form, message, Input, Space, Button } from 'antd'

const { TextArea } = Input

export const SchemaModal: React.FC<{
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
                        collectionName
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
                            pattern: /^[a-z0-9A-Z_-]+$/
                        }
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
