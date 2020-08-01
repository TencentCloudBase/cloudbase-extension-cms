import React from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { updateSchema } from '@/services/schema'
import { Form, message, Input, Switch, Space, Button, Drawer, Row, Col } from 'antd'
import { getFieldFormItem } from './Components'

const { TextArea } = Input

export const ContentDrawer: React.FC<{
    visible: boolean
    schema: SchemaV2
    onClose: () => void
}> = ({ visible, onClose, schema }) => {
    const { projectId } = useParams()
    const ctx = useConcent('schema')

    const hasLargeContent = schema?.fields?.find(
        (_) => _.type === 'RichText' || _.type === 'Markdown'
    )
    const drawerWidth = hasLargeContent ? '80%' : 400

    return (
        <Drawer
            width={drawerWidth}
            destroyOnClose
            footer={null}
            onClose={onClose}
            visible={visible}
            title={`新建【${schema?.displayName}】`}
        >
            <Form
                name="basic"
                layout="vertical"
                labelCol={{ span: 6 }}
                onFinish={(v = {}) => {
                    console.log(v)

                    // updateSchema(currentSchema?._id, {
                    //     fields: currentSchema?.fields
                    //         ? [...currentSchema.fields, addField]
                    //         : [addField]
                    // })
                    //     .then(() => {
                    //         onClose()
                    //         message.success('添加字段成功')
                    //         ctx.dispatch('getSchemas', projectId)
                    //     })
                    //     .catch(() => {
                    //         message.error('添加字段失败')
                    //     })
                }}
            >
                <Row gutter={[24, 24]}>
                    {schema?.fields?.map((filed, index) => (
                        <Col xs={24} sm={24} md={12} lg={12} xl={12} key={index}>
                            {getFieldFormItem(filed, index)}
                        </Col>
                    ))}
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
