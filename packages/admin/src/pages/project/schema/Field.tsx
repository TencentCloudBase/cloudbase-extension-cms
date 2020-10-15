import React, { useState } from 'react'
import { useParams } from 'umi'
import { useConcent } from 'concent'
import { updateSchema } from '@/services/schema'
import { Modal, message, Input, InputNumber } from 'antd'
import { ISwitch, IDatePicker } from '@/components/Fields'
import { ContentCtx, SchmeaCtx } from 'typings/store'

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
export const getFieldDefaultValueInput = (type: string) => {
  switch (type) {
    case 'Number':
      return <InputNumber style={{ width: '50%' }} placeholder="此值的默认值" />
    case 'Boolean':
      return <ISwitch />
    case 'Date':
    case 'DateTime':
      return <IDatePicker type={type} />
    case 'Object':
      return <ObjectInput />
    default:
      return <Input placeholder="此值的默认值" />
  }
}

/**
 * 删除字段
 */
export const DeleteFieldModal: React.FC<{
  visible: boolean
  onClose: () => void
}> = ({ visible, onClose }) => {
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, SchmeaCtx>('schema')
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
