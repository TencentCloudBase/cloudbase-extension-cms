import React from 'react'
import { ExclamationCircleTwoTone } from '@ant-design/icons'
import { Card, Space, Typography, Button, Tooltip } from 'antd'

import { FieldTypes } from '@/common'

export interface FieldType {
    icon: React.ReactNode
    name: string
    type: string
}

export const SchemaFieldRender: React.SFC<{
    schema: SchemaV2
}> = (props) => {
    const { schema } = props

    return (
        <div>
            {schema?.fields
                ?.filter((_) => _)
                .map((field, index) => {
                    const type = FieldTypes.find((_) => _.type === field.type)

                    return (
                        <Card key={index} className="schema-field-card">
                            <Space style={{ flex: '1 1 auto' }}>
                                <div className="icon">{type?.icon}</div>
                                <div className="flex-column">
                                    <Space align="center" style={{ marginBottom: '10px' }}>
                                        <Typography.Title level={4} style={{ marginBottom: 0 }}>
                                            {field.displayName}
                                        </Typography.Title>
                                        <Typography.Text strong># {field.name}</Typography.Text>
                                        <Tooltip title={field.description}>
                                            <ExclamationCircleTwoTone
                                                style={{ fontSize: '16px' }}
                                            />
                                        </Tooltip>
                                    </Space>
                                    <Space>
                                        <Button size="small">{type?.name}</Button>
                                    </Space>
                                </div>
                            </Space>

                            <Space>
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
