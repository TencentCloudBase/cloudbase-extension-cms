import React from 'react'
import { Input, InputNumber, Form, Space, Select, Switch, Typography, Row, Col, Button } from 'antd'
import { ISwitch, IDatePicker } from '@/components/Fields'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

const { Option } = Select
const { Text } = Typography

/**
 * JSON Object 输入框
 */
const ObjectInput: React.FC<{
  value?: any
  onChange?: any
}> = ({ value, onChange }) => {
  let formatValue = value
  if (typeof value === 'object') {
    formatValue = JSON.stringify(value)
  }

  return <Input.TextArea value={formatValue} placeholder="请输入 JSON 字符串" onChange={onChange} />
}

/**
 * 获取字段默认值的输入 JSX
 */
export const getFieldDefaultValueInput = (
  type: SchemaFieldType,
  options: {
    enumElementType: 'string' | 'number'
    dateFormatType: 'timestamp-ms' | 'timestamp-s' | 'date' | 'string'
  }
) => {
  const { dateFormatType, enumElementType } = options

  switch (type) {
    case 'Number':
      return <InputNumber style={{ width: '60%' }} placeholder="此值的默认值" />
    case 'Boolean':
      return <ISwitch />
    case 'Date':
    case 'DateTime':
      return <IDatePicker style={{ width: '60%' }} type={type} dateFormatType={dateFormatType} />
    case 'Object':
      return <ObjectInput />
    case 'Enum':
      if (enumElementType === 'number') {
        return <InputNumber style={{ width: '60%' }} placeholder="此值的默认值" />
      } else {
        return <Input placeholder="此值的默认值" />
      }
    default:
      return <Input placeholder="此值的默认值" />
  }
}

/**
 * 获取类型对应的编辑信息
 */
export function getFieldFormItem(
  type: string,
  options: {
    formValue: any
    schemas: Schema[]
    selectedField: SchemaField
    fieldAction: 'edit' | 'create'
    connectSchema?: Schema
  }
) {
  const { schemas, connectSchema, selectedField, fieldAction, formValue } = options

  switch (type) {
    case 'String':
    case 'MultiLineString':
    case 'Number':
      if (selectedField.name === '_id') return
      return (
        <Form.Item style={{ marginBottom: 0 }}>
          <Row gutter={[24, 0]}>
            <Col flex="1 1 auto">
              <Form.Item label={selectedField.type === 'Number' ? '最小值' : '最小长度'} name="min">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={selectedField.type === 'Number' ? '最小值，如 1' : '最小长度，如 1'}
                />
              </Form.Item>
            </Col>
            <Col flex="1 1 auto">
              <Form.Item label={selectedField.type === 'Number' ? '最大值' : '最大长度'} name="max">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={
                    selectedField.type === 'Number' ? '最大值，如 1000' : '最大长度，如 1000'
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      )
    case 'Date':
    case 'DateTime':
      return (
        <Form.Item label="时间存储格式" name="dateFormatType" validateTrigger={['onChange']}>
          <Select placeholder="时间存储格式">
            <Option value="timestamp-ms">Unix Timestamp 毫秒</Option>
            <Option value="timestamp-s">Unix Timestamp 秒</Option>
            <Option value="date">Date 对象</Option>
            <Option value="string">时间字符串</Option>
          </Select>
        </Form.Item>
      )
    case 'Enum':
      return (
        <>
          <Form.Item label="枚举元素类型" name="enumElementType" validateTrigger={['onChange']}>
            <Select placeholder="元素值类型">
              <Option value="string">字符串</Option>
              <Option value="number">数字</Option>
            </Select>
          </Form.Item>
          <Form.Item label="枚举元素">
            <Form.List name="enumElements">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields?.map((field, index) => {
                      return (
                        <EnumListItem
                          key={index}
                          field={field}
                          onRemove={remove}
                          formValue={formValue}
                        />
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
                        <PlusOutlined /> 添加枚举元素
                      </Button>
                    </Form.Item>
                  </div>
                )
              }}
            </Form.List>
          </Form.Item>
        </>
      )
    case 'File':
    case 'Image':
      return (
        <>
          <Form.Item label="资源链接格式" name="resourceLinkType" validateTrigger={['onChange']}>
            <Select placeholder="资源链接格式">
              <Option value="fileId">FileId</Option>
              <Option value="https">HTTPS</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="form-item">
              <Form.Item style={{ marginBottom: 0 }}>
                <Text>允许多个内容</Text>
                <Form.Item name="isMultiple" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch />
                </Form.Item>
                <Text type="secondary">在创建内容时，允许创建多个内容，数据将以数组格式存储</Text>
              </Form.Item>
            </div>
          </Form.Item>
        </>
      )
    case 'Media':
      return (
        <>
          <Form.Item label="资源链接格式" name="resourceLinkType" validateTrigger={['onChange']}>
            <Select placeholder="资源链接格式">
              <Option value="fileId">FileId</Option>
              <Option value="https">HTTPS</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="form-item">
              <Form.Item style={{ marginBottom: 0 }}>
                <Text>允许多个内容</Text>
                <Form.Item name="isMultiple" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch />
                </Form.Item>
                <Text type="secondary">在创建内容时，允许创建多个内容，数据将以数组格式存储</Text>
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item label="媒体类型" name="mediaType" validateTrigger={['onChange']}>
            <Select placeholder="媒体类型">
              <Option value="video">视频</Option>
              <Option value="music">音频</Option>
            </Select>
          </Form.Item>
        </>
      )
    case 'Connect':
      return (
        <>
          <Form.Item label="关联">
            <Space>
              <Form.Item
                label="关联内容"
                name="connectResource"
                rules={[{ required: true, message: '请选择关联内容！' }]}
              >
                <Select style={{ width: 200 }}>
                  {schemas?.map((schema: Schema) => (
                    <Option value={schema._id} key={schema._id}>
                      {schema.displayName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="展示字段"
                name="connectField"
                rules={[{ required: true, message: '请选择关联需要展示的字段！' }]}
              >
                <Select style={{ width: 200 }} placeholder="关联字段">
                  {connectSchema?.fields?.length ? (
                    connectSchema.fields?.map((field: SchemaField) => (
                      <Option value={field.name} key={field.name}>
                        {field.displayName}
                      </Option>
                    ))
                  ) : (
                    <Option value="" key={selectedField.name} disabled>
                      空
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item>
            <div className="form-item">
              <Form.Item name="connectMany" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch disabled={fieldAction === 'edit'} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <span>是否关联多项（支持选择多个关联文档）</span>
                {fieldAction === 'edit' && (
                  <>
                    <br />
                    <Text type="warning">关联多项与关联单项无法转换</Text>
                  </>
                )}
              </Form.Item>
            </div>
          </Form.Item>
        </>
      )
    default:
      return ''
  }
}

/**
 * 枚举值列表 Item
 */
const EnumListItem: React.FC<{ field: any; formValue: any; onRemove: (name: number) => void }> = (
  props
) => {
  const { field, formValue, onRemove } = props
  const enumValueType = formValue?.enumElementType || 'string'

  return (
    <Form.Item>
      <Form.Item noStyle name={[field.name, 'label']} validateTrigger={['onChange', 'onBlur']}>
        <Input placeholder="枚举元素展示别名，如 “已发布”" style={{ width: '45%' }} />
      </Form.Item>
      {enumValueType === 'number' && (
        <Form.Item noStyle name={[field.name, 'value']} validateTrigger={['onChange', 'onBlur']}>
          <InputNumber
            placeholder="枚举元素值，如 100"
            style={{
              width: '45%',
              marginLeft: '2%',
            }}
          />
        </Form.Item>
      )}
      {enumValueType === 'string' && (
        <Form.Item noStyle name={[field.name, 'value']} validateTrigger={['onChange', 'onBlur']}>
          <Input
            placeholder="枚举元素值，如 published"
            style={{
              width: '45%',
              marginLeft: '2%',
            }}
          />
        </Form.Item>
      )}
      <MinusCircleOutlined
        className="dynamic-delete-button"
        style={{ margin: '0 0 0 15px' }}
        onClick={() => {
          onRemove(field.name)
        }}
      />
    </Form.Item>
  )
}
