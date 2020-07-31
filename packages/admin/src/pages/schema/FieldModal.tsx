import React from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { updateSchema } from '@/services/schema'
import { Modal, Form, message, Input, Switch, Space, Button } from 'antd'

const { TextArea } = Input

export const FieldModal: React.FC<{
    visible: boolean
    field: { name: string; type: string }
    onClose: () => void
}> = ({ visible, onClose, field }) => {
    const { projectId } = useParams()
    const ctx = useConcent()
    const {
        state: { currentSchema }
    } = ctx

    return (
        <Modal
            centered
            footer={null}
            visible={visible}
            title={`新建【${field?.name}】字段`}
            onOk={() => onClose()}
            onCancel={() => onClose()}
        >
            <Form
                name="basic"
                layout="vertical"
                labelCol={{ span: 6 }}
                onFinish={(v = {}) => {
                    const { displayName, fieldName, description, isRequired, isHidden } = v

                    const addField = {
                        description,
                        type: field.type,
                        is_hidden: isHidden,
                        field_name: fieldName,
                        is_required: isRequired,
                        display_name: displayName
                    }

                    updateSchema({
                        id: currentSchema?._id,
                        fields: currentSchema?.fields
                            ? [...currentSchema.fields, addField]
                            : [addField]
                    }).then(() => {
                        message.success('添加字段成功')
                        ctx.dispatch('getSchemas', projectId)
                    })
                }}
            >
                <Form.Item
                    label="展示名称"
                    name="displayName"
                    rules={[{ required: true, message: '请输入展示名称！' }]}
                >
                    <Input placeholder="展示名称，如文章标题" />
                </Form.Item>

                <Form.Item
                    label="数据库字段名"
                    name="fieldName"
                    rules={[{ required: true, message: '请输入数据库名称！' }]}
                >
                    <Input placeholder="数据库字段名，如 title" />
                </Form.Item>

                <Form.Item label="TextArea" name="description">
                    <TextArea placeholder="原型描述，如博客文章标题" />
                </Form.Item>

                <Form.Item>
                    <div className="form-item">
                        <Form.Item
                            name="isRequired"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <span>是否必须</span>
                        </Form.Item>
                    </div>
                </Form.Item>
                <Form.Item>
                    <div className="form-item">
                        <Form.Item
                            name="isHidden"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <span>是否隐藏</span>
                        </Form.Item>
                    </div>
                </Form.Item>

                <Form.Item>
                    <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => onClose()}>取消</Button>
                        <Button type="primary" htmlType="submit">
                            添加
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
