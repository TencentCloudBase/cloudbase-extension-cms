import React, { Suspense } from 'react'
import {
  Space,
  Tag,
  Spin,
  Form,
  Input,
  Switch,
  Button,
  Col,
  Select,
  Typography,
  InputNumber,
} from 'antd'

import { Rule } from 'antd/es/form'

import {
  IConnectEditor,
  IConnectRender,
  IDatePicker,
  IFileRender,
  ILazyImage,
  IUploader,
} from '@/components/Fields'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

const MarkdownEditor = React.lazy(() => import('@/components/Fields/Markdown'))
const RichTextEditor = React.lazy(() => import('@/components/Fields/RichText'))

const { TextArea } = Input
const { Option } = Select

const LazyMarkdownEditor: React.FC = (props: any) => (
  <Suspense fallback={<Spin />}>
    <MarkdownEditor {...props} />
  </Suspense>
)

const LazyRichTextEditor: React.FC = (props: any) => (
  <Suspense fallback={<Spin />}>
    <RichTextEditor {...props} />
  </Suspense>
)

/**
 * 根据类型获取展示字段组件
 */
export function getFieldRender(field: SchemaFieldV2) {
  const { name, type } = field

  switch (type) {
    case 'String':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => text
    case 'Text':
    case 'MultiLineString':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Text ellipsis style={{ width: '120px' }}>
          {text}
        </Typography.Text>
      )
    case 'Boolean':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        return <Typography.Text>{record[name] ? 'True' : 'False'}</Typography.Text>
      }
    case 'Number':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => {
        const num = typeof record[name] === 'undefined' ? '-' : record[name]
        return <Typography.Text>{num} </Typography.Text>
      }
    case 'Url':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Link href={record[name]} target="_blank">
          {text}
        </Typography.Link>
      )
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
        return <ILazyImage src={data} />
      }
    case 'File':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => <IFileRender src={record[name]} />
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
          <Space direction="vertical">
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
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Text ellipsis style={{ width: '200px' }}>
          {text}
        </Typography.Text>
      )

    case 'RichText':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <Typography.Text ellipsis style={{ width: '200px' }}>
          {text}
        </Typography.Text>
      )

    case 'Connect':
      return (
        text: React.ReactNode,
        record: any,
        index: number,
        action: any
      ): React.ReactNode | React.ReactNode[] => (
        <IConnectRender value={record[name]} field={field} />
      )
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
  let rule: Rule | null

  switch (type) {
    case 'Url':
      rule = { type: 'url', message: '请输入正确的网址' }
      break
    case 'Email':
      rule = {
        type: 'email',
        message: '请输入正确的邮箱',
      }
      break
    case 'Number':
      rule = { type: 'number', message: '请输入正确的数字' }
      break
    case 'Tel':
      rule = {
        pattern: /^\d+$/,
        message: '请输入正确的电话号码',
      }
      break
    default:
      rule = null
  }

  return rule
}

const getRules = (field: SchemaFieldV2): Rule[] => {
  const { isRequired, displayName, min, max, type } = field

  const rules: Rule[] = []

  if (isRequired) {
    rules.push({ required: isRequired, message: `${displayName} 字段是必须要的` })
  }

  if (min) {
    const validType = type === 'String' || type === 'MultiLineString' ? 'string' : 'number'
    rules.push({
      min,
      type: validType,
      message: validType === 'string' ? `不能小于最小长度 ${min}` : `不能小于最小值 ${min}`,
    })
  }

  if (max) {
    const validType = type === 'String' || type === 'MultiLineString' ? 'string' : 'number'
    rules.push({
      max,
      type: validType,
      message: validType === 'string' ? `不能大于最大长度 ${max}` : `不能大于最大值 ${max}`,
    })
  }

  const rule = getValidateRule(field.type)

  rule && rules.push(rule)

  return rules
}

/**
 * 字段编辑器
 */
export function getFieldEditor(field: SchemaFieldV2, key: number) {
  const { name, type, min, max, enumElements } = field

  let FieldEditor: React.ReactNode

  switch (type) {
    case 'String':
      FieldEditor = <Input type="text" />
      break
    case 'MultiLineString':
      FieldEditor = <TextArea />
      break
    case 'Boolean':
      FieldEditor = <Switch checkedChildren="True" unCheckedChildren="False" />
      break
    case 'Number':
      FieldEditor = <InputNumber style={{ width: '100%' }} min={min} max={max} />
      break
    case 'Url':
      FieldEditor = <Input />
      break
    case 'Email':
      FieldEditor = <Input />
      break
    case 'Tel':
      FieldEditor = <Input style={{ width: '100%' }} />
      break
    case 'Date':
      FieldEditor = <IDatePicker type="Date" />
      break
    case 'DateTime':
      FieldEditor = <IDatePicker type="DateTime" />
      break
    case 'Image':
      FieldEditor = <IUploader type="image" />
      break
    case 'File':
      FieldEditor = <IUploader type="file" />
      break
    case 'Enum':
      FieldEditor = (
        <Select>
          {enumElements?.length ? (
            enumElements?.map((ele, index) => (
              <Option value={ele.value} key={index}>
                {ele.label}
              </Option>
            ))
          ) : (
            <Option value="" disabled>
              空
            </Option>
          )}
        </Select>
      )
      break
    case 'Array':
      FieldEditor = (
        <Form.List name={name}>
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields?.map((field, index) => {
                  return (
                    <Form.Item key={index}>
                      <Form.Item {...field} noStyle validateTrigger={['onChange', 'onBlur']}>
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
                  )
                })}
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
      )
      break
    case 'Markdown':
      FieldEditor = <LazyMarkdownEditor key={key} />
      break
    case 'RichText':
      FieldEditor = <LazyRichTextEditor key={String(key)} />
      break
    case 'Connect':
      FieldEditor = <IConnectEditor field={field} />
      break
    default:
      FieldEditor = <Input />
  }

  return FieldEditor
}

/**
 * 字段编辑表单
 */
export function getFieldFormItem(field: SchemaFieldV2, key: number) {
  const rules = getRules(field)
  const { name, type, description, displayName } = field

  let FieldEditor: any = getFieldEditor(field, key)
  let FormItem

  switch (type) {
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
          {FieldEditor}
        </Form.Item>
      )
      break
    default:
      FormItem = (
        <Form.Item key={key} name={name} rules={rules} label={displayName} extra={description}>
          {FieldEditor}
        </Form.Item>
      )
  }

  // 弹性布局
  if (type === 'Markdown' || type === 'RichText') {
    return (
      <Col xs={24} sm={24} md={24} lg={24} xl={24} key={key}>
        {FormItem}
      </Col>
    )
  }

  return (
    <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12} key={key}>
      {FormItem}
    </Col>
  )
}
