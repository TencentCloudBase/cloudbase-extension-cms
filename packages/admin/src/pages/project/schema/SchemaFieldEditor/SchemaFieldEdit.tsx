import { useConcent } from 'concent'
import { useRequest } from 'umi'
import React, { useState, useEffect, useMemo } from 'react'
import { updateSchema } from '@/services/schema'
import {
  Row,
  Col,
  Modal,
  Form,
  message,
  Input,
  Switch,
  Space,
  Button,
  Select,
  Typography,
  Alert,
} from 'antd'
import { ContentCtx, SchmeaCtx } from 'typings/store'
import { FieldTypes } from '@/common'
import {
  random,
  isDateType,
  isAssetType,
  formatStoreTimeByType,
  getMissingSystemFields,
  getSchemaCustomFields,
  getProjectId,
} from '@/utils'
import { getFieldDefaultValueInput, getFieldFormItem } from './Field'

const { TextArea } = Input
const { Text } = Typography

// 不能设置默认值的类型
const NoDefaultValueTypes = ['File', 'Image', 'Array', 'Connect']

// 保留字段名
const ReservedFieldNames = ['_status']

/**
 * 添加字段，字段编辑弹窗
 */
export const SchemaFieldEditorModal: React.FC<{
  visible: boolean
  onClose: () => void
}> = ({ visible, onClose }) => {
  const projectId = getProjectId()
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const contentCtx = useConcent<{}, ContentCtx>('content')
  const [formValue, setFormValue] = useState<any>()
  const [connectSchema, setConnectSchema] = useState<Schema>()

  const {
    state: { currentSchema, schemas, fieldAction, selectedField, selectedFieldIndex },
  } = ctx

  // 新增字段
  // 编辑字段
  const { run: editField, loading } = useRequest(
    async (fieldAttr: SchemaField) => {
      // 判断是否存在同名字段
      const schemaFields = getSchemaCustomFields(currentSchema)
      const sameNameFieldIndex = schemaFields.findIndex(
        (_: SchemaField) => _.name === fieldAttr.name
      )

      const sameNameField = sameNameFieldIndex > -1 ? schemaFields[sameNameFieldIndex] : null

      if (
        sameNameField &&
        (fieldAction === 'create' ||
          (fieldAction === 'edit' &&
            sameNameField.id !== fieldAttr.id &&
            sameNameFieldIndex !== selectedFieldIndex))
      ) {
        throw new Error(`已存在同名字段 ${fieldAttr.name}，请勿重复创建`)
      }

      // 过滤掉值为 undefined 的数据
      const field: any = Object.keys(fieldAttr)
        .filter((key) => typeof fieldAttr[key] !== 'undefined')
        .reduce(
          (val, key) => ({
            ...val,
            [key]: fieldAttr[key],
          }),
          {}
        )

      let fields = currentSchema?.fields || []

      // 创建新的字段
      if (fieldAction === 'create') {
        fields.push({
          ...field,
          order: fields.length,
          type: selectedField.type,
          id: random(32),
        } as any)

        // 补充确实的系统字段
        const missingSystemFields = getMissingSystemFields(currentSchema)
        fields.push(...missingSystemFields)
      }

      // 编辑字段
      if (fieldAction === 'edit') {
        const index = fields.findIndex(
          (_: any) => _.id === selectedField?.id || _.name === selectedField?.name
        )

        const fieldData = {
          ...selectedField,
          ...field,
        }

        if (index > -1) {
          fields.splice(index, 1, fieldData)
        } else {
          fields.push(fieldData)
        }
      }

      // 更新 schema fields
      await updateSchema(projectId, currentSchema?._id || '', {
        fields,
      })

      // 重新加载数据
      ctx.mr.getSchemas(projectId)
      contentCtx.mr.getContentSchemas(projectId)
      onClose()
    },
    {
      manual: true,
      onError: (e) =>
        message.error(
          fieldAction === 'create' ? `添加字段失败：${e.message}` : `更新字段失败:${e.message}`
        ),
      onSuccess: () => message.success(fieldAction === 'create' ? '添加字段成功' : '更新字段成功'),
    }
  )

  // 字段类型的名称
  const fieldTypeName = FieldTypes.find((_) => _.type === selectedField.type)?.name

  // 弹窗标题
  const modalTitle =
    fieldAction === 'create' ? (
      `添加【${selectedField?.name}】字段`
    ) : (
      <Space>
        <Text>编辑【{selectedField?.displayName}】</Text>
        <Text type="secondary">#{fieldTypeName}</Text>
      </Space>
    )

  // 编辑字段
  useEffect(() => {
    if (selectedField?.connectResource) {
      const schema = schemas.find((_: Schema) => _._id === selectedField.connectResource)
      setConnectSchema(schema)
    }

    if (selectedField) {
      setFormValue(selectedField)
    }
  }, [selectedField])

  // 是否是系统保留字段
  const isFieldNameReserved = ReservedFieldNames.includes(formValue?.name)

  // 类型特定的属性
  const SpecificAttributeFormItem = getFieldFormItem(selectedField?.type, {
    schemas,
    connectSchema,
    selectedField,
    fieldAction,
    formValue,
  })

  // 新建字段时，form 的初始值
  const InitailValues: any = useMemo(() => getFormInitailValues(fieldAction, selectedField), [
    selectedField,
  ])

  return (
    <Modal
      centered
      destroyOnClose
      width={700}
      footer={null}
      visible={visible}
      title={modalTitle}
      maskClosable={false}
      onOk={() => onClose()}
      onCancel={() => onClose()}
    >
      {fieldAction === 'create' && selectedField?.description && (
        <Alert type="info" message={selectedField?.description} />
      )}
      <br />
      <Form
        name="basic"
        layout="vertical"
        labelCol={{ span: 6 }}
        initialValues={InitailValues}
        onValuesChange={(changed, v) => {
          if (changed.connectResource) {
            const schema = schemas.find((_: Schema) => _._id === v.connectResource)
            setConnectSchema(schema)
          }

          setFormValue(v)
        }}
        onFinish={(v: any) => {
          // 格式化 Object 为对象
          if (selectedField?.type === 'Object') {
            try {
              v.defaultValue = JSON.parse(v.defaultValue)
            } catch (error) {
              // ignore
            }
          }

          // 格式化默认时间，与 dateFormatType 保持一致
          if (v.dateFormatType && v.defaultValue) {
            v.defaultValue = formatStoreTimeByType(v.defaultValue, v.dateFormatType)
          }

          editField(v)
        }}
      >
        <Form.Item
          label="展示名称"
          name="displayName"
          rules={[{ required: true, message: '请输入展示名称！' }]}
        >
          <Input placeholder="展示名称，如文章标题" disabled={selectedField.isSystem} />
        </Form.Item>

        <Form.Item
          label="数据库字段名"
          name="name"
          rules={[
            { required: true, message: '请输入数据库名称！' },
            {
              message: '字段名只能使用英文字母、数字、-、_ 等符号',
              pattern: /^[a-z0-9A-Z_-]+$/,
            },
          ]}
        >
          <Input placeholder="数据库字段名，如 title" disabled={selectedField.isSystem} />
        </Form.Item>

        {/^_/.test(formValue?.name) && !selectedField.isSystem && (
          <Alert
            type="warning"
            message="系统会使用 _ 开头的单词作为系统字段名，为了避免和系统字段冲突，建议您使用其他命名规则"
          />
        )}

        {isFieldNameReserved && !selectedField.isSystem && (
          <Alert
            type="error"
            className="mt-2 mb-2"
            message={`${formValue.name} 是系统保留字段，请使用其他名称`}
          />
        )}

        <Form.Item label="描述" name="description">
          <TextArea placeholder="字段描述，如博客文章标题" />
        </Form.Item>

        {hasDefaultValue(selectedField) ? null : (
          <Form.Item
            label="默认值"
            name="defaultValue"
            rules={
              selectedField?.type === 'Object'
                ? [
                    {
                      validator: (_, value) => {
                        // 空值不校验
                        // 值的类型为 object 时，说明已经是合法的值，无需要再校验
                        if (
                          typeof value === 'undefined' ||
                          (typeof value === 'object' && value !== null)
                        )
                          return Promise.resolve()
                        try {
                          const json = JSON.parse(value)
                          if (typeof json !== 'object') {
                            return Promise.reject('非法的 JSON 字符串')
                          }
                          return Promise.resolve()
                        } catch (error) {
                          return Promise.reject('非法的 JSON 字符串')
                        }
                      },
                    },
                  ]
                : []
            }
          >
            {getFieldDefaultValueInput(selectedField?.type, {
              enumElementType: formValue?.enumElementType,
              dateFormatType: formValue?.dateFormatType,
            })}
          </Form.Item>
        )}

        {/* 特定字段的特殊属性 */}
        {SpecificAttributeFormItem}

        {/* 必要字段 */}
        <Form.Item>
          <div className="form-item">
            <Form.Item style={{ marginBottom: 0 }}>
              <Text>是否必需</Text>
              <Form.Item name="isRequired" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch disabled={selectedField.isSystem} />
              </Form.Item>
              <Text type="secondary">在创建内容时，此段是必需填写的</Text>
            </Form.Item>
          </div>
        </Form.Item>

        {/* 隐藏字段 */}
        <Form.Item>
          <div className="form-item">
            <Form.Item style={{ marginBottom: 0 }}>
              <Text>是否隐藏</Text>
              <Form.Item name="isHidden" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
              <Text type="secondary">在内容集合表格展示时隐藏该字段</Text>
            </Form.Item>
          </div>
        </Form.Item>

        {/* 排序字段 */}
        <Form.Item>
          <div className="form-item">
            <Form.Item style={{ marginBottom: 0 }}>
              <Text>设为排序字段</Text>
              <Row align="middle">
                <Col flex="1 1 auto">
                  <Form.Item noStyle name="isOrderField" valuePropName="checked">
                    <Switch disabled={selectedField?.name === '_id'} />
                  </Form.Item>
                </Col>
                <Col flex="0 0 auto">
                  {formValue?.isOrderField && (
                    <Form.Item noStyle name="orderDirection">
                      <Select style={{ width: '200px' }} placeholder="选择排序规则">
                        <Select.Option key="desc" value="desc">
                          降序（越大越靠前）
                        </Select.Option>
                        <Select.Option key="asc" value="asc">
                          升序（越小越靠前）
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Col>
              </Row>
              <Text type="secondary">获取内容时根据此字段排序</Text>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item>
          <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => onClose()}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={isFieldNameReserved}
            >
              {fieldAction === 'create' ? '添加' : '更新'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const hasDefaultValue = (field: SchemaField) => {
  return NoDefaultValueTypes.includes(field?.type) || field?.isSystem
}

/**
 * 获取表单初始值
 */
const getFormInitailValues = (action: 'edit' | 'create', field: SchemaField) => {
  const type = field.type

  if (action === 'edit') {
    if (isDateType(type) && !field.dateFormatType) {
      field.dateFormatType = 'timestamp-ms'
    }

    if (isAssetType(type) && !field.resourceLinkType) {
      field.resourceLinkType = 'fileId'
    }

    return field
  }

  const createInitialValues: Partial<SchemaField> = {}
  if (type === 'Enum') {
    createInitialValues.enumElementType = 'string'
  }

  if (type === 'Date' || type === 'DateTime') {
    createInitialValues.dateFormatType = 'timestamp-ms'
  }

  if (type === 'File' || type === 'Image') {
    createInitialValues.resourceLinkType = 'fileId'
  }

  if (type === 'Media') {
    createInitialValues.mediaType = 'music'
  }

  return createInitialValues
}
