import React, { useCallback } from 'react'
import { Form, Space, Button, Row, Input, Switch, InputNumber, Select } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import { IDatePicker, IConnectEditor } from '@/components/Fields'
import { useConcent } from 'concent'
import { ContentCtx } from 'typings/store'
import { calculateFieldWidth } from '@/utils'

const { Option } = Select

const ContentTableSearchForm: React.FC<{
  schema: Schema
  onSearch: (v: Record<string, any>) => void
}> = ({ onSearch }) => {
  const ctx = useConcent<{}, ContentCtx>('content')
  const { searchFields, searchParams } = ctx.state

  // 删除字段
  const deleteField = useCallback((field: SchemaField) => {
    ctx.mr.removeSearchField(field)
  }, [])

  return (
    <div>
      {searchFields.length ? (
        <Form
          name="basic"
          layout="inline"
          initialValues={searchParams}
          style={{ marginTop: '15px' }}
          onFinish={(v: any) => onSearch(v)}
        >
          <Row>
            {searchFields.map((field, index) => (
              <Space
                key={index}
                align="center"
                style={{ marginRight: '15px', marginBottom: '10px' }}
              >
                {getSearchFieldItem(field, index)}
                <DeleteTwoTone onClick={() => deleteField(field)} style={{ marginLeft: '-15px' }} />
              </Space>
            ))}
            <Space style={{ marginBottom: '10px' }}>
              <Button
                type="primary"
                onClick={() => {
                  ctx.mr.clearSearchField()
                  onSearch({})
                }}
              >
                重置
              </Button>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
            </Space>
          </Row>
        </Form>
      ) : null}
    </div>
  )
}

/**
 * 生成搜索字段输入组件
 */
const getSearchFieldItem = (field: SchemaField, key: number) => {
  const { name, type, min, max, displayName, enumElements } = field
  const width = calculateFieldWidth(field)

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
        <Form.Item key={key} name={name} label={displayName}>
          <Input type="text" style={{ width }} />
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
          <InputNumber min={min} max={max} style={{ width }} />
        </Form.Item>
      )
      break

    case 'Date':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <IDatePicker type="Date" dateFormatType={field.dateFormatType} />
        </Form.Item>
      )
      break
    case 'DateTime':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <IDatePicker type="DateTime" dateFormatType={field.dateFormatType} />
        </Form.Item>
      )
      break
    case 'Enum':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <Select mode="multiple" style={{ width }}>
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
          <IConnectEditor field={field} />
        </Form.Item>
      )
      break
    case 'Array':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <Input placeholder="目前只支持单个值搜索" style={{ width }} />
        </Form.Item>
      )
      break
    default:
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <Input style={{ width }} />
        </Form.Item>
      )
  }

  return FormItem
}

export default ContentTableSearchForm
