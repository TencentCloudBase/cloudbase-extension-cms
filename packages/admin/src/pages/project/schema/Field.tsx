import React, { useState } from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { updateSchema } from '@/services/schema'
import { Modal, message, Input, InputNumber } from 'antd'
import { ISwitch, IDatePicker } from '@/components/Fields'
import { CtxM } from 'typings/store'

/**
 * 获取字段默认值的输入 JSX
 */
export const getFieldDefaultValueInput = (type: string) => {
  switch (type) {
    case 'Number':
      return <InputNumber style={{ width: '50%' }} placeholder="此值的默认值" />
    case 'Boolean':
      return <ISwitch />
    case 'Date':
    case 'DateTime':
      return <IDatePicker type={type} />
    default:
      return <Input placeholder="此值的默认值" />
  }
}

type Ctx = CtxM<{}, 'schema'> // 属于schema模块的实例上下文类型
type ContentCtx = CtxM<{}, 'content'>

/**
 * 删除字段
 */
export const DeleteFieldModal: React.FC<{
  visible: boolean
  onClose: () => void
}> = ({ visible, onClose }) => {
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, Ctx>('schema')
  const contentCtx = useConcent<{}, ContentCtx>('content')
  const [loading, setLoading] = useState(false)

  const {
    state: { currentSchema, selectedField },
  } = ctx

  return (
    <Modal
      centered
      destroyOnClose
      visible={visible}
      title={`删除【${selectedField?.displayName}】字段`}
      okButtonProps={{
        loading,
      }}
      onOk={async () => {
        setLoading(true)
        const fields: any[] = (currentSchema.fields || []).slice()
        const index = fields.findIndex(
          (_: any) => _.id === selectedField.id || _.name === selectedField.name
        )

        if (index > -1) {
          fields.splice(index, 1)
        }

        try {
          await updateSchema(projectId, currentSchema?._id, {
            fields,
          })
          currentSchema.fields.splice(index, 1)
          message.success('删除字段成功')
          ctx.mr.getSchemas(projectId)
          contentCtx.mr.getContentSchemas(projectId)
        } catch (error) {
          message.error('删除字段失败')
        } finally {
          onClose()
          setLoading(false)
        }
      }}
      onCancel={() => onClose()}
    >
      确认删除【{selectedField.displayName}（{selectedField?.name}）】字段吗？
    </Modal>
  )
}
