import React, { useState, useEffect } from 'react'
import { Typography, Space, Tag, Empty, Spin } from 'antd'

import { getTempFileURL } from '@/utils'

const LazyImage: React.FC<{ src: string }> = ({ src }) => {
    if (!src) return <Empty image="/img/empty.svg" imageStyle={{ height: '60px' }} />
    if (!/^cloud:\/\/\S+/.test(src)) {
        return <img src={src} />
    }

    const [imgUrl, setImgUrl] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTempFileURL(src)
            .then((url) => {
                setLoading(false)
                setImgUrl(url)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    return loading ? <Spin /> : <img src={imgUrl} />
}

/**
 * 根据类型获取展示字段组件
 */
export function getFieldRender(field: { name: string; type: string }) {
    const { name, type } = field

    switch (type) {
        case 'String':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => <Typography.Text>{text}</Typography.Text>
        case 'Boolean':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => <Typography.Text>{text}</Typography.Text>
        case 'Number':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => <Typography.Text>{text}</Typography.Text>
        case 'Url':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => <Typography.Link>{text}</Typography.Link>
        case 'Email':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => <Typography.Text>{text}</Typography.Text>
        case 'Date':
            return undefined
        case 'DateTime':
            return undefined
        case 'Image':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => {
                const data = record[name]
                return <LazyImage src={data} />
            }
        case 'File':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => <Typography.Link>{text}</Typography.Link>
        case 'Array':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => {
                if (!record[name]) {
                    return text
                }

                return (
                    <Space>
                        {record[name].map((val: string, index: number) => (
                            <Tag key={index}>{val}</Tag>
                        ))}
                    </Space>
                )
            }
        case 'Markdown':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => text
        case 'RichText':
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => text
        default:
            return (
                text: React.ReactNode,
                record: any,
                index: number,
                action: any
            ): React.ReactNode | React.ReactNode[] => text
    }
}
