import _ from 'lodash'
import React, { useCallback } from 'react'
import { DeleteTwoTone } from '@ant-design/icons'
import {
  Form,
  Space,
  Button,
  Row,
  Input,
  Switch,
  Select,
  Tooltip,
  Modal,
  message,
  InputNumber,
} from 'antd'
import { IDatePicker, IConnectEditor } from '@/components/Fields'
import { useConcent } from 'concent'
import { ContentCtx } from 'typings/store'
import { calculateFieldWidth, getProjectId } from '@/utils'
import { updateSchema } from '@/services/schema'
import { useRequest } from 'umi'

const { Option } = Select

// 判断两个 field 数组是否包含相同的 field
const isFieldSame = (field1: any[], field2: any[]) => {
  if (field1?.length !== field2?.length) return false
  return _.differenceBy(field1, field2, 'name')?.length === 0
}

/**
 * 内容搜索表单
 */
const ContentTableSearchForm: React.FC<{
  schema: Schema
  onSearch: (v: Record<string, any>) => void
}> = ({ schema, onSearch }) => {
  const [form] = Form.useForm()
  const projectId = getProjectId()
  const ctx = useConcent<{}, ContentCtx>('content')
  const { searchFields, searchParams } = ctx.state

  // 删除字段
  const deleteField = useCallback((field: SchemaField) => {
    ctx.mr.removeSearchField(field)
  }, [])

  // 保存检索条件
  const { run: saveSearchFields, loading } = useRequest(
    async () => {
      await updateSchema(projectId, schema._id, {
        searchFields,
      })
      ctx.mr.getContentSchemas(projectId)
    },
    {
      manual: true,
      onSuccess: () => message.success('保存检索条件成功！'),
      onError: (e) => message.error(e.message || '保存检索条件失败！'),
    }
  )

  return (
    <div>
      {searchFields.length ? (
        <Form
          name="basic"
          form={form}
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
              <Tooltip title="删除所有检索条件">
                <Button
                  onClick={() => {
                    const modal = Modal.confirm({
                      title: '是否删除保存的检索条件？',
                      onCancel: () => {
                        modal.destroy()
                      },
                      onOk: async () => {
                        try {
                          await updateSchema(projectId, schema._id, {
                            searchFields: [],
                          })
                          message.success('重置检索条件成功！')
                          ctx.mr.getContentSchemas(projectId)
                        } catch (error) {
                          message.error('重置检索条件失败！')
                        }
                      },
                    })
                    // 重置检索条件
                    ctx.mr.clearSearchField()
                    onSearch({})
                  }}
                >
                  删除
                </Button>
              </Tooltip>

              <Tooltip title="清空搜索输入值，重新搜索">
                <Button
                  type="primary"
                  onClick={() => {
                    ctx.setState(
                      {
                        searchParams: {},
                      },
                      () => {
                        console.log('callback')
                        form.resetFields()
                        onSearch({})
                      }
                    )
                  }}
                >
                  重置搜索
                </Button>
              </Tooltip>

              <Button type="primary" htmlType="submit">
                搜索
              </Button>

              {/* 仅字段不同时，才显示保存按钮 */}
              {!isFieldSame(searchFields, schema.searchFields) && (
                <Tooltip title="保存检索条件，下次直接搜索">
                  <Button type="primary" loading={loading} onClick={saveSearchFields}>
                    保存
                  </Button>
                </Tooltip>
              )}
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
    case 'Time':
    case 'DateTime':
      FormItem = (
        <Form.Item key={key} name={name} label={displayName}>
          <IDatePicker type={type} dateFormatType={field.dateFormatType} />
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
