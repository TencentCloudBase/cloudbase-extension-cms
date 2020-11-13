import { useParams } from 'umi'
import { useConcent } from 'concent'
import React, { useCallback, useMemo, useState } from 'react'
import { Modal, Typography, Upload, message, Checkbox, Space, Alert } from 'antd'
import { SchmeaCtx, ContentCtx } from 'typings/store'
import { random, saveContentToFile } from '@/utils'
import { InboxOutlined } from '@ant-design/icons'
import { createSchema } from '@/services/schema'

const { Title, Paragraph } = Typography
const { Dragger } = Upload
const CheckboxGroup = Checkbox.Group

/**
 * Schema 导出
 */
export const SchemaExportModal: React.FC<{
  visible: boolean
  onClose: () => void
}> = ({ visible, onClose }) => {
  const ctx = useConcent<{}, SchmeaCtx>('schema')

  const {
    state: { schemas },
  } = ctx

  const [indeterminate, setIndeterminate] = useState(false)
  const [checkAll, setCheckAll] = useState(false)
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([])

  // 可选 Schemas
  const schemaOptions = useMemo(() => {
    if (!schemas?.length) return []
    return schemas?.map(({ displayName, collectionName }) => {
      return {
        label: displayName,
        value: collectionName,
      }
    })
  }, [schemas])

  // 全选
  const onCheckAllChange = useCallback(
    (e) => {
      const { checked } = e.target
      setCheckAll(checked)
      setIndeterminate(false)
      checked ? setSelectedSchemas(schemaOptions.map((_) => _.value)) : setSelectedSchemas([])
    },
    [schemas]
  )

  // 选择
  const onCheckChange = useCallback(
    (v) => {
      setSelectedSchemas(v)
      setCheckAll(v.length === schemaOptions.length)
      setIndeterminate(!!v.length && v.length < schemaOptions.length)
    },
    [schemas]
  )

  return (
    <Modal
      centered
      visible={visible}
      title="选择导出需要导出的原型"
      onOk={async () => {
        const exportSchemas = selectedSchemas.map((_: string) => {
          const schema = schemas.find((item) => item.collectionName === _) as Schema
          // 关联字段记录了 schema 的 id，导出 schema 需要携带 _id
          const { fields, collectionName, displayName, _id } = schema
          return { fields, collectionName, displayName, _id }
        })
        const fileName = `schema-export-${random(8)}.json`
        saveContentToFile(JSON.stringify(exportSchemas), fileName)
        message.success('导出原型成功！')
      }}
      okButtonProps={{
        disabled: !selectedSchemas?.length,
      }}
      onCancel={() => onClose()}
    >
      {schemas.length ? (
        <Space direction="vertical">
          <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
            全选
          </Checkbox>
          <CheckboxGroup options={schemaOptions} value={selectedSchemas} onChange={onCheckChange} />
        </Space>
      ) : (
        <span>无可导出原型</span>
      )}
    </Modal>
  )
}

/**
 * Schema 导入
 */
export const SchemaImportModal: React.FC<{
  visible: boolean
  onClose: () => void
}> = ({ visible, onClose }) => {
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const contentCtx = useConcent<{}, ContentCtx>('content')
  const { schemas } = ctx.state
  const [loading, setLoading] = useState(false)
  const [importSchemas, setImportSchemas] = useState<Partial<Schema>[]>([])

  // 读取、校验导入文件
  const onUpload = useCallback(
    (file) => {
      // 文件路径
      const fileReader = new FileReader()
      fileReader.onload = (e) => {
        const json = e.target?.result as string
        if (!json) {
          message.error('导入数据不能为空！')
          return
        }

        try {
          const importData = JSON.parse(json)

          // 检查数据格式是否符合基本要求
          const schemaValid = importData.every(
            (_: any) => _.fields?.length && _.displayName && _.collectionName
          )
          if (!schemaValid) {
            message.error('导入数据格式错误')
            return
          }

          // 检查集合名是否存在冲突
          const conflict = importData.some((_: any) =>
            schemas.find((item) => item.collectionName === _.collectionName)
          )

          if (conflict) {
            message.error(
              '导入原型集合名和已有原型集合名存在冲突，无法导入，请修改冲突后重新导入！'
            )
            return
          }

          setImportSchemas(importData)
        } catch (error) {
          message.error('导入数据格式错误，非法的 JSON 字符串')
        }
      }

      fileReader.readAsText(file)
      return false
    },
    [schemas]
  )

  // 创建原型
  const onImportData = useCallback(async () => {
    setLoading(true)
    try {
      const tasks = importSchemas.map(async (schema) => await createSchema(projectId, schema))
      await Promise.all(tasks)
      message.success('导入原型成功！')
      ctx.mr.getSchemas(projectId)
      contentCtx.mr.getContentSchemas(projectId)
    } catch (error) {
      message.error('导入原型失败')
    } finally {
      onClose()
    }
    setLoading(false)
  }, [importSchemas, projectId])

  return (
    <Modal
      centered
      destroyOnClose
      title="导入原型"
      closable={true}
      visible={visible}
      onCancel={() => onClose()}
      onOk={onImportData}
      okButtonProps={{
        loading,
      }}
    >
      <Title level={4}>注意事项</Title>
      <Alert message="仅支持导入 JSON 格式的数据" />
      <br />
      <Dragger accept=".json" listType="text" beforeUpload={onUpload}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽上传文件，开始导入数据</p>
      </Dragger>
      <br />
      {importSchemas.length ? (
        <>
          <Paragraph>共计 {importSchemas.length} 个原型</Paragraph>
          {importSchemas.map((schema, index) => (
            <Paragraph key={index}>
              模型名称：{schema.displayName}，数据库名：{schema.collectionName}，共计{' '}
              {schema.fields?.length} 个字段
            </Paragraph>
          ))}
          <Alert
            message="请确认导入原型集合名与已有原型集合名不存在冲突，否则会导入失败！"
            type="warning"
          />
        </>
      ) : null}
    </Modal>
  )
}
