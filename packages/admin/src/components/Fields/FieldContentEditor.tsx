import React, { Suspense } from 'react'
import { Spin, Form, Input, Switch, Button, Select, InputNumber, Typography } from 'antd'
import { Rule } from 'antd/es/form'
import { IConnectEditor, IDatePicker, IFileAndImageEditor } from '@/components/Fields'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { IObjectEditor } from './Object'

const MarkdownEditor = React.lazy(() => import('@/components/Fields/Markdown'))
const RichTextEditor = React.lazy(() => import('@/components/Fields/RichText'))

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

const LazyMarkdownEditor: React.FC<{ id: number }> = (props: any) => (
  <Suspense fallback={<Spin />}>
    <MarkdownEditor {...props} />
  </Suspense>
)

const LazyRichTextEditor: React.FC<{ id: number }> = (props: any) => (
  <Suspense fallback={<Spin />}>
    <RichTextEditor {...props} />
  </Suspense>
)

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

const getRules = (field: SchemaField): Rule[] => {
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
export function getFieldEditor(field: SchemaField, key: number) {
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
    case 'Time':
    case 'Date':
    case 'DateTime':
      FieldEditor = <IDatePicker type={type} dateFormatType={field.dateFormatType} />
      break
    case 'Image':
      FieldEditor = (
        <IFileAndImageEditor type="image" field={field} resourceLinkType={field.resourceLinkType} />
      )
      break
    case 'File':
    case 'Media':
      FieldEditor = (
        <IFileAndImageEditor type="file" field={field} resourceLinkType={field.resourceLinkType} />
      )
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
      FieldEditor = <LazyMarkdownEditor id={key} />
      break
    case 'RichText':
      FieldEditor = <LazyRichTextEditor id={key} />
      break
    case 'Connect':
      FieldEditor = <IConnectEditor field={field} />
      break
    case 'Object':
      FieldEditor = <IObjectEditor />
      break
    default:
      FieldEditor = <Input />
  }

  return FieldEditor
}

/**
 * 字段编辑表单
 */
export function getFieldFormItem(field: SchemaField, key: number) {
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
          label={<Text strong>{displayName}</Text>}
          extra={description}
          valuePropName="checked"
        >
          {FieldEditor}
        </Form.Item>
      )
      break
    default:
      FormItem = (
        <Form.Item
          key={key}
          name={name}
          rules={rules}
          label={<Text strong>{displayName}</Text>}
          extra={description}
        >
          {FieldEditor}
        </Form.Item>
      )
  }

  return FormItem
}
