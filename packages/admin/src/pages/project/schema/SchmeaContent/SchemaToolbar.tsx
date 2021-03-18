import { useConcent } from 'concent'
import React, { useState, useCallback, useEffect } from 'react'
import { Modal, message, Space, Checkbox, Typography, Tooltip } from 'antd'
import { EditTwoTone, DeleteTwoTone, ExportOutlined, CopyOutlined } from '@ant-design/icons'
import { getProjectId, random, saveContentToFile } from '@/utils'
import { deleteSchema } from '@/services/schema'
import { ContentCtx, SchmeaCtx } from 'typings/store'

export interface TableListItem {
  key: number
  name: string
  status: string
  updatedAt: number
  createdAt: number
  progress: number
  money: number
}

const iconStyle = {
  fontSize: '16px',
}

const SchemaEdit: React.FC = () => {
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const {
    state: { currentSchema },
  } = ctx

  // 删除模型
  const [deleteSchemaVisible, setDeleteSchmeaVisible] = useState(false)

  // 导出 Schema 数据
  const exportSchema = useCallback(() => {
    const modal = Modal.confirm({
      centered: true,
      title: '确认导出模型数据？',
      onCancel: () => {
        modal.destroy()
      },
      onOk: () => {
        const fileName = `schema-${currentSchema.collectionName}-${random(8)}.json`
        const { fields, collectionName, displayName } = currentSchema
        saveContentToFile(JSON.stringify([{ fields, collectionName, displayName }]), fileName)
        message.success('模型导出成功！')
      },
    })
  }, [currentSchema])

  const copySchema = useCallback(() => {
    ctx.mr.copySchema()
  }, [currentSchema])

  return (
    <>
      <Space size="middle">
        {/* 编辑模型 */}
        <Tooltip title="编辑模型">
          <EditTwoTone
            style={iconStyle}
            onClick={() => {
              ctx.mr.editSchema()
            }}
          />
        </Tooltip>
        {/* 删除模型 */}
        <Tooltip title="删除模型">
          <DeleteTwoTone style={iconStyle} onClick={() => setDeleteSchmeaVisible(true)} />
        </Tooltip>
        {/* 导出模型 */}
        <Tooltip title="导出模型">
          <ExportOutlined style={{ ...iconStyle, color: '#0052d9' }} onClick={exportSchema} />
        </Tooltip>
        <Tooltip title="复制当前模型为新的模型">
          <CopyOutlined style={{ ...iconStyle, color: '#0052d9' }} onClick={copySchema} />
        </Tooltip>
      </Space>

      <DeleteSchemaModal
        visible={deleteSchemaVisible}
        onClose={() => setDeleteSchmeaVisible(false)}
      />
    </>
  )
}

/**
 * 删除模型弹窗
 */
export const DeleteSchemaModal: React.FC<{
  visible: boolean
  onClose: () => void
}> = ({ visible, onClose }) => {
  const projectId = getProjectId()
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const contentCtx = useConcent<{}, ContentCtx>('content')
  const { currentSchema } = ctx.state
  const [loading, setLoading] = useState(false)
  const [deleteCollection, setDeleteCollection] = useState(false)

  useEffect(() => {
    setDeleteCollection(false)
  }, [visible])

  return (
    <Modal
      centered
      title="删除内容模型"
      visible={visible}
      onCancel={() => onClose()}
      okButtonProps={{
        loading,
      }}
      onOk={async () => {
        try {
          setLoading(true)
          await deleteSchema(projectId, currentSchema?._id, deleteCollection)
          message.success('删除内容模型成功！')
          ctx.dispatch('getSchemas', projectId)
          contentCtx.dispatch('getContentSchemas', projectId)
        } catch (error) {
          message.error('删除内容模型失败！')
        } finally {
          onClose()
          setLoading(false)
        }
      }}
    >
      <Space direction="vertical">
        <Typography.Text>
          确认删【{currentSchema?.displayName} ({currentSchema?.collectionName})】内容模型？
        </Typography.Text>
        <Checkbox
          checked={deleteCollection}
          onChange={(e) => setDeleteCollection(e.target.checked)}
        >
          同时删除数据表（警告：删除后数据无法找回）
        </Checkbox>
      </Space>
    </Modal>
  )
}

export default SchemaEdit
