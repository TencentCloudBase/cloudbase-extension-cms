import React, { useEffect } from 'react'
import { Form, Space, Button, Row, Col, Input, Switch, InputNumber, Select } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import { CustomDatePicker, ConnectEditor } from './FieldComponents'

const { Option } = Select

export const ContentTableSearch: React.FC<{
  schema: SchemaV2
  searchFields: SchemaFieldV2[]
  setSearchFields: (fields: SchemaFieldV2[]) => void
  onSearch: (v: Record<string, any>) => void
}> = ({ schema, onSearch, searchFields, setSearchFields }) => {
  const deleteField = (field: SchemaFieldV2) => {
    const index = searchFields.findIndex((_) => _.id === field.id)
    const fields = searchFields.slice(0)
    fields.splice(index, 1)
    setSearchFields(fields)
  }

  useEffect(() => {
    setSearchFields([])
  }, [schema])

  return (
    <div>
      {searchFields.length ? (
        <Form
          name="basic"
          layout="inline"
          initialValues={{}}
          onFinish={(v: any) => onSearch(v)}
          style={{ marginTop: '15px' }}
        >
          <Row>
            {searchFields.map((field, index) => (
              <Space key={index} align="center" style={{ marginRight: '15px' }}>
                {getSearchFieldItem(field, index)}
                <DeleteTwoTone onClick={() => deleteField(field)} style={{ marginLeft: '-15px' }} />
              </Space>
            ))}
          </Row>
          <Row>
            <Col flex="1 1 auto" style={{ textAlign: 'right' }}>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSearchFields([])
                      onSearch({})
                    }}
                  >
                    重置
                  </Button>
                  <Button type="primary" htmlType="submit">
                    搜索
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : null}
    </div>
  )
}

/**
 * 字段编辑
 */
export function getSearchFieldItem(field: SchemaFieldV2, key: number) {
  const { name, type, min, max, displayName, enumElements } = field

  let FormItem

  switch (type) {
    case 'String':
    case 'Url':
    case 'Email':
    case 'Tel':
    case 'Markdown':
    case 'RichText':
    case 'MultiLineString':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName} style={{ minWidth: '100px' }}>
          <Input type="text" />
        </Form.Item>
      )
      break
    case 'Boolean':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName} valuePropName="checked">
          <Switch checkedChildren="True" unCheckedChildren="False" />
        </Form.Item>
      )
      break
    case 'Number':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <InputNumber min={min} max={max} />
        </Form.Item>
      )
      break

    case 'Date':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <CustomDatePicker type="Date" />
        </Form.Item>
      )
      break
    case 'DateTime':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <CustomDatePicker type="DateTime" />
        </Form.Item>
      )
      break
    case 'Enum':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <Select mode="multiple" style={{ minWidth: '100px' }}>
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
        </Form.Item>
      )
      break
    case 'Connect':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <ConnectEditor field={field} />
        </Form.Item>
      )
      break
    case 'Array':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <Input placeholder="目前只支持单个值搜索" />
        </Form.Item>
      )
      break
    default:
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <Input />
        </Form.Item>
      )
  }

  return FormItem
}
