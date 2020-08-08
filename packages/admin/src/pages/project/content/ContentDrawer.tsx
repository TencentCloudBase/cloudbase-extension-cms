import React from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { Form, message, Space, Button, Drawer, Row } from 'antd'
import { createContent, updateContent } from '@/services/content'
import { getFieldFormItem } from './Components'

export const ContentDrawer: React.FC<{
    visible: boolean
    schema: SchemaV2
    onClose: () => void
    onOk: () => void
}> = ({ visible, onClose, onOk, schema }) => {
    const ctx = useConcent('content')
    const { currentSchema, selectedContent, contentAction } = ctx.state

    const hasLargeContent = schema?.fields?.find(
        (_) => _.type === 'RichText' || _.type === 'Markdown'
    )

    const drawerWidth = hasLargeContent ? '80%' : '40%'

    const initialValues =
        contentAction === 'create'
            ? schema?.fields.reduce(
                  (prev, field) => ({
                      ...prev,
                      [field.name]: field.defaultValue,
                  }),
                  {}
              )
            : selectedContent

    return (
        <Drawer
            destroyOnClose
            footer={null}
            visible={visible}
            onClose={onClose}
            width={drawerWidth}
            title={`新建【${schema?.displayName}】`}
        >
            <Form
                name="basic"
                layout="vertical"
                labelCol={{ span: 6 }}
                // onValuesChange={(v) => {}}
                initialValues={initialValues}
                onFinish={(v = {}) => {
                    if (contentAction === 'create') {
                        createContent(currentSchema?.collectionName, v)
                            .then(() => {
                                onOk()
                                message.success('创建内容成功')
                            })
                            .catch(() => {
                                message.error('创建内容失败')
                            })
                    }

                    if (contentAction === 'edit') {
                        updateContent(currentSchema?.collectionName, v._id, v)
                            .then(() => {
                                onOk()
                                message.success('创建内容成功')
                            })
                            .catch(() => {
                                message.error('创建内容失败')
                            })
                    }
                }}
            >
                <Row gutter={[24, 24]}>
                    {schema?.fields?.map((filed, index) => getFieldFormItem(filed, index))}
                </Row>

                <Form.Item>
                    <Space size="large">
                        <Button onClick={onClose}>取消</Button>
                        <Button type="primary" htmlType="submit">
                            确定
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Drawer>
    )
}
