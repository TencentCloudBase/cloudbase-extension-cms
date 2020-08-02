import React, { useState } from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { updateSchema } from '@/services/schema'
import { Modal, Form, message, Input, Switch, Space, Button, Select } from 'antd'

const { TextArea } = Input
const { Option } = Select

// 不能设置默认值的类型
const negativeTypes = ['File', 'Image', 'Array', 'Connect']

export const CreateFieldModal: React.FC<{
    visible: boolean
    onClose: () => void
}> = ({ visible, onClose }) => {
    const ctx = useConcent('schema')
    const { projectId } = useParams()
    const [connectSchema, setConnectSchema] = useState<SchemaV2>()
    const {
        state: { currentSchema, schemas, fieldAction, selectField }
    } = ctx

    return (
        <Modal
            centered
            destroyOnClose
            footer={null}
            visible={visible}
            title={
                fieldAction === 'create'
                    ? `新建【${selectField?.name}】字段`
                    : `编辑【${selectField?.displayName}】`
            }
            onOk={() => onClose()}
            onCancel={() => onClose()}
        >
            <Form
                name="basic"
                layout="vertical"
                labelCol={{ span: 6 }}
                initialValues={fieldAction === 'edit' ? selectField : {}}
                onValuesChange={(v) => {
                    if (v.connectResource) {
                        const schema = schemas.find((_: SchemaV2) => _._id === v.connectResource)
                        setConnectSchema(schema)
                    }
                }}
                onFinish={(v = {}) => {
                    // 过滤掉值为 undefined 的数据
                    const field = Object.keys(v)
                        .filter((key) => typeof v[key] !== 'undefined')
                        .reduce(
                            (val, key) => ({
                                ...val,
                                [key]: v[key]
                            }),
                            {}
                        )

                    let fields = currentSchema?.fields || []

                    // 创建新的字段
                    if (fieldAction === 'create') {
                        fields.push({
                            ...field,
                            type: selectField.type
                        })
                    }

                    // 编辑字段
                    if (fieldAction === 'edit') {
                        const index = fields.findIndex((_: any) => _.id === selectField.id)
                        if (index > -1) {
                            fields.splice(index, 1, {
                                ...selectField,
                                field
                            })
                        }
                    }

                    // 更新 schema fields
                    updateSchema(currentSchema?._id, {
                        fields
                    })
                        .then(() => {
                            message.success('添加字段成功')
                            ctx.dispatch('getSchemas', projectId)
                        })
                        .catch(() => {
                            message.error('添加字段失败')
                        })
                        .finally(() => {
                            onClose()
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
                    name="name"
                    rules={[
                        { required: true, message: '请输入数据库名称！' },
                        {
                            message: '字段名只能使用英文字母、数字、-、_ 等符号',
                            pattern: /^[a-z0-9A-Z_-]+$/
                        }
                    ]}
                >
                    <Input placeholder="数据库字段名，如 title" />
                </Form.Item>

                <Form.Item label="描述" name="description">
                    <TextArea placeholder="原型描述，如博客文章标题" />
                </Form.Item>

                {selectField?.type === 'Connect' && (
                    <Form.Item label="关联">
                        <Space>
                            <Form.Item
                                label="关联的内容"
                                name="connectResource"
                                rules={[{ required: true, message: '请选择关联内容！' }]}
                            >
                                <Select style={{ width: 200 }}>
                                    {schemas?.map((schema: SchemaV2) => (
                                        <Option value={schema._id} key={schema._id}>
                                            {schema.displayName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="关联的字段"
                                name="connectField"
                                rules={[{ required: true, message: '请选择关联内容字段！' }]}
                            >
                                <Select style={{ width: 200 }} placeholder="关联字段">
                                    {connectSchema?.fields?.length ? (
                                        connectSchema.fields?.map((field: SchemaFieldV2) => (
                                            <Option value={field.name} key={field.name}>
                                                {field.displayName}
                                            </Option>
                                        ))
                                    ) : (
                                        <Option value="" key={selectField.name}>
                                            空
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        </Space>
                    </Form.Item>
                )}

                {negativeTypes.includes(selectField?.type) ? null : (
                    <Form.Item label="默认值" name="defaultValue">
                        <Input placeholder="此值的默认值" />
                    </Form.Item>
                )}

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

export const DeleteFieldModal: React.FC<{
    visible: boolean
    onClose: () => void
}> = ({ visible, onClose }) => {
    const { projectId } = useParams()
    const ctx = useConcent('schema')

    const {
        state: { currentSchema, selectField }
    } = ctx

    return (
        <Modal
            centered
            destroyOnClose
            visible={visible}
            title={`删除【${selectField?.displayName}】字段`}
            onOk={() => {
                const fields = currentSchema.fields || []
                const index = fields.find((_: any) => _.id === selectField.id)

                if (index > -1) {
                    fields.splice(index, 1)
                }

                updateSchema(currentSchema?._id, {
                    fields
                })
                    .then(() => {
                        message.success('删除字段成功')
                        ctx.dispatch('getSchemas', projectId)
                    })
                    .catch(() => {
                        message.error('删除字段失败')
                    })
                    .finally(() => {
                        onClose()
                    })
            }}
            onCancel={() => onClose()}
        >
            确认删除【{selectField.displayName}（{selectField?.name}）】字段吗？
        </Modal>
    )
}
