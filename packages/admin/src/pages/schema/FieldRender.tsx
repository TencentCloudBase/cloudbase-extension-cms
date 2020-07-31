import React from 'react'
import { Card, Space, Typography, Button } from 'antd'
import { FieldTypes } from '@/common'

export interface SchemaField {
    // 字段类型
    type: string

    // 展示标题
    display_name: string

    // 在数据库中的字段名
    name: string

    // 字段描述
    description: string

    // 默认排序字段
    order_by: string

    // 是否隐藏
    is_hidden: boolean

    // 是否必需字段
    is_required: boolean

    // 是否唯一
    is_unique: boolean

    // 在 API 返回结果中隐藏
    is_hidden_in_api: boolean

    // 是否加密
    is_encrypted: boolean

    // 默认值
    default_value: any

    // 最小长度/值
    min: number

    // 最大长度/值
    max: number

    // 校验
    validator: string

    // 样式属性
    style: {}

    // 联合类型记录值
    union: {}

    // 枚举类型
    enum: {}
}

export interface FieldType {
    icon: React.ReactNode
    name: string
    type: string
}

export const SchemaV1FieldRender: React.SFC<{
    schema: SchemaV1
}> = (props) => {
    const { schema } = props

    return (
        <div>
            {schema?.fields?.map((field, index) => {
                const type = FieldTypes.find((_) => _.type === field.fieldType)

                return (
                    <Card bordered key={index} className="field-card">
                        <Space style={{ flex: '1 1 auto' }}>
                            <div className="icon">{type?.icon}</div>
                            <div className="field-info">
                                <Typography.Title level={4}>{field.fieldLabel}</Typography.Title>
                                <div className="type">{type?.name}</div>
                            </div>
                        </Space>
                        <Space align="end">
                            <Button size="small" type="primary">
                                编辑
                            </Button>
                            <Button size="small" danger>
                                删除
                            </Button>
                        </Space>
                    </Card>
                )
            })}
        </div>
    )
}

export const SchemaV2FieldRender: React.SFC<{
    schema: SchemaV2
}> = (props) => {
    const { schema } = props

    return (
        <div>
            {schema?.fields?.map((field, index) => {
                const type = FieldTypes.find((_) => _.type === field.type)

                return (
                    <Card key={index} className="field-card">
                        <Space style={{ flex: '1 1 auto' }}>
                            <div className="icon">{type?.icon}</div>
                            <div className="field-info">
                                <Typography.Title level={4}>{field.display_name}</Typography.Title>
                                <div className="type">{type?.name}</div>
                            </div>
                        </Space>
                        <Space align="end">
                            <Button size="small" type="primary">
                                编辑
                            </Button>
                            <Button size="small" danger>
                                删除
                            </Button>
                        </Space>
                    </Card>
                )
            })}
        </div>
    )
}
