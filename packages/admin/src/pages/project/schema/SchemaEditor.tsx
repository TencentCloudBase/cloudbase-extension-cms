import React, { useCallback } from 'react'
import { useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { SchmeaCtx } from 'typings/store'
import { createSchema, updateSchema } from '@/services/schema'
import { Modal, Form, message, Input, Space, Button, Typography } from 'antd'
import { SYSTEM_FIELDS } from '@/common'

const { TextArea } = Input

const ActionTip = {
  create: '创建',
  edit: '更新',
  copy: '复制',
}

const DefaultKeys = ['_id', '_createTime', '_updateTime']

/**
 * 新建/更新模型
 */
const SchemaEditor: React.FC = () => {
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const contentCtx = useConcent('content')
  const { schemaEditAction, schemaEditVisible, currentSchema } = ctx.state

  // 关闭弹窗
  const onClose = () =>
    ctx.setState({
      schemaEditVisible: false,
    })

  // action 提示文案
  const actionTip = ActionTip[schemaEditAction]

  // 创建/更新模型
  const { run, loading } = useRequest(
    async (data: Schema) => {
      const { displayName, collectionName, description } = data

      if (schemaEditAction === 'create') {
        await createSchema(projectId, {
          displayName,
          collectionName,
          description,
          fields: SYSTEM_FIELDS,
        })
      }

      if (currentSchema && schemaEditAction === 'edit') {
        const diffData = Object.keys(data)
          .filter((key) => currentSchema[key] !== data[key])
          .reduce(
            (ret, key) => ({
              ...ret,
              [key]: data[key],
            }),
            {}
          )

        await updateSchema(projectId, currentSchema?._id, diffData)
      }

      if (currentSchema && schemaEditAction === 'copy') {
        const newSchema = Object.keys(data)
          .filter((key) => !DefaultKeys.includes(key))
          .reduce(
            (ret, key) => ({
              ...ret,
              [key]: data[key],
            }),
            {}
          )

        await createSchema(projectId, { ...newSchema, fields: currentSchema.fields })
      }

      onClose()
      ctx.mr.getSchemas(projectId)
      contentCtx.dispatch('getContentSchemas', projectId)
    },
    {
      manual: true,
      onError: () => message.error(`${actionTip}模型失败`),
      onSuccess: () => message.success(`${actionTip}模型成功`),
    }
  )

  const getInitialValues = useCallback(
    (action: string, currentSchema: Schema) => {
      switch (action) {
        case 'create':
          return undefined
        case 'edit':
          return currentSchema
        case 'copy':
          return {
            ...currentSchema,
            collectionName: `${currentSchema.collectionName}-copy`,
          }
        default:
          return currentSchema
      }
    },
    [schemaEditAction, currentSchema]
  )

  return (
    <Modal
      centered
      destroyOnClose
      footer={null}
      width={600}
      visible={schemaEditVisible}
      onOk={() => onClose()}
      onCancel={() => onClose()}
      title={`${actionTip}模型`}
    >
      <Form
        name="basic"
        layout="vertical"
        labelAlign="left"
        labelCol={{ span: 6 }}
        initialValues={getInitialValues(schemaEditAction, currentSchema)}
        onFinish={(v: any) => {
          if (schemaEditAction === 'copy' && v.collectionName === currentSchema.collectionName) {
            message.error('复制模型数据库名不能与已有模型数据库名相同')
            onClose()
            return
          }
          run(v)
        }}
      >
        <Form.Item
          label="展示名称"
          name="displayName"
          rules={[{ required: true, message: '请输入展示名称！' }]}
        >
          <Input placeholder="展示名称，如文章" />
        </Form.Item>

        <Form.Item
          label="数据库名"
          name="collectionName"
          help={
            schemaEditAction === 'edit' && (
              <Typography.Text type="danger">
                更改数据库名会自动重命名原数据库（危险操作！仅管理员可操作！）
              </Typography.Text>
            )
          }
          rules={[
            { required: true, message: '请输入数据库名称！' },
            {
              message: '字段名只能使用英文字母、数字、-、_ 等符号',
              pattern: /^[a-z0-9A-Z_-]+$/,
            },
          ]}
        >
          <Input placeholder="数据库名，如 article" />
        </Form.Item>

        <Form.Item label="描述信息" name="description">
          <TextArea placeholder="描述信息，会展示在对应内容的管理页面顶部，可用于内容提示，支持 HTML 片段" />
        </Form.Item>

        <Form.Item>
          <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => onClose()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {actionTip}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SchemaEditor
