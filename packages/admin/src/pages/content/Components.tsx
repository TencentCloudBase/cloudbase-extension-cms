import React, { useState, useEffect } from 'react'
import {
    Typography,
    Space,
    Tag,
    Empty,
    Spin,
    Form,
    Input,
    Switch,
    InputNumber,
    DatePicker,
    Upload,
    message,
    Button
} from 'antd'

import { getTempFileURL, uploadFile } from '@/utils'
import { Rule } from 'antd/es/form'
import { InboxOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

const { Dragger } = Upload
const { TextArea } = Input

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
        case 'Tel':
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
                        {record[name]?.map((val: string, index: number) => (
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

/**
 * 根据类型获取验证规则
 */
function getValidateRule(type: string) {
    let rule: Rule

    switch (type) {
        case 'Url':
            rule = { pattern: /^https?:\/\/[^\s$.?#].[^\s]*$/, message: '请输入正确的网址' }
            break
        case 'Email':
            rule = { pattern: /^https?:\/\/[^\s$.?#].[^\s]*$/, message: '请输入正确的网址' }
            break
        case 'Number':
            rule = { pattern: /^\d+$/, message: '请输入正确的数字' }
            break
        case 'Tel':
            rule = {
                pattern: /^\d+$/,
                message: '请输入正确的电话号码'
            }
            break
        default:
            rule = {}
    }

    return rule
}

const getRules = (field: SchemaFieldV2): Rule[] => {
    const { isRequired, displayName } = field

    const rules: Rule[] = []

    if (isRequired) {
        rules.push({ required: isRequired, message: `${displayName} 字段是必须要的` })
    }

    rules.push(getValidateRule(field.type))

    return rules
}

// custom file/image uploader
const CustomUploader: React.FC<{
    value: string
    onChange: (v: string) => void
}> = (props) => {
    return (
        <Dragger
            beforeUpload={async (file) => {
                const fileId: string = await uploadFile(file)
                return Promise.reject()
            }}
            customRequest={() => {
                console.log('object')
            }}
        >
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽图片上传</p>
        </Dragger>
    )
}

export function getFieldFormItem(field: SchemaFieldV2, key: number) {
    const rules = getRules(field)
    const { name, type, min, max, description, displayName, defaultValue } = field

    let FormItem

    switch (type) {
        case 'String':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <Input
                        type="text"
                        minLength={min}
                        maxLength={max}
                        defaultValue={defaultValue}
                    />
                </Form.Item>
            )
            break
        case 'MultiLineString':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <TextArea minLength={min} maxLength={max} defaultValue={defaultValue} />
                </Form.Item>
            )
            break
        case 'Boolean':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="true"
                        unCheckedChildren="false"
                        defaultChecked={defaultValue}
                    />
                </Form.Item>
            )
            break
        case 'Number':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={min}
                        max={max}
                        defaultValue={defaultValue}
                    />
                </Form.Item>
            )
            break
        case 'Url':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <Input defaultValue={defaultValue} />
                </Form.Item>
            )
            break
        case 'Email':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <Input defaultValue={defaultValue} />
                </Form.Item>
            )
            break
        case 'Tel':
            FormItem = (
                <Form.Item key={key} name={name} rules={rules} label={displayName}>
                    <Input style={{ width: '100%' }} />
                </Form.Item>
            )
            break
        case 'Date':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>
            )
            break
        case 'DateTime':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>
            )
            break
        case 'Image':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <CustomUploader />
                </Form.Item>
            )
            break
        case 'File':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                    valuePropName="fileList"
                >
                    <Dragger
                        beforeUpload={async (file) => {
                            const fileId: string = await uploadFile(file)
                            console.log(fileId)
                            return Promise.reject()
                        }}
                        onChange={(info) => {
                            console.log(info)
                        }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件上传</p>
                    </Dragger>
                </Form.Item>
            )
            break
        case 'Array':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <Form.List name={name}>
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    {fields?.map((field, index) => (
                                        <Form.Item key={field.key}>
                                            <Form.Item
                                                {...field}
                                                noStyle
                                                validateTrigger={['onChange', 'onBlur']}
                                            >
                                                <Input style={{ width: '60%' }} />
                                            </Form.Item>
                                            <MinusCircleOutlined
                                                className="dynamic-delete-button"
                                                style={{ margin: '0 8px' }}
                                                onClick={() => {
                                                    remove(field.name)
                                                }}
                                            />
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => {
                                                add()
                                            }}
                                            style={{ width: '60%' }}
                                        >
                                            <PlusOutlined /> 添加字段
                                        </Button>
                                    </Form.Item>
                                </div>
                            )
                        }}
                    </Form.List>
                </Form.Item>
            )
            break
        case 'Markdown':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <Input defaultValue={defaultValue} />
                </Form.Item>
            )
            break
        case 'RichText':
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <Input defaultValue={defaultValue} />
                </Form.Item>
            )
            break
        default:
            FormItem = (
                <Form.Item
                    key={key}
                    name={name}
                    rules={rules}
                    label={displayName}
                    extra={description}
                >
                    <Input defaultValue={defaultValue} />
                </Form.Item>
            )
    }

    return FormItem
}
