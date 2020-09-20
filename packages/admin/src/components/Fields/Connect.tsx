import React, { useState } from 'react'
import { Typography, message, Space, Tag, Select } from 'antd'
import { useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { getSchema } from '@/services/schema'
import { getContents } from '@/services/content'

const { Option } = Select
const { Text } = Typography

/**
 * 关联渲染
 */
export const IConnectRender: React.FC<{
  value?: Record<string, any>
  field: SchemaFieldV2
}> = (props) => {
  const { value, field } = props
  const { connectField, connectMany } = field

  if (!value || typeof value === 'string' || typeof value?.[0] === 'string') return <span>-</span>

  if (!connectMany) {
    return <Text>{value[connectField]}</Text>
  }

  return (
    <Space>
      {value
        .filter((_: any) => _)
        .map((record: any, index: number) => (
          <Tag key={index}>{record?.[connectField]}</Tag>
        ))}
    </Space>
  )
}

/**
 * 关联类型，编辑
 */
export const IConnectEditor: React.FC<{
  value?: Record<string, any>
  field: SchemaFieldV2
  onChange?: (v: string) => void
}> = (props) => {
  const { projectId } = useParams<any>()
  const ctx = useConcent('content')
  const { value, onChange, field } = props
  const { connectField, connectResource, connectMany } = field
  const [records, setRecords] = useState<Record<string, any>>([])
  const [loading, setLoading] = useState(true)

  useRequest(
    async () => {
      const { schemas } = ctx.state
      let schema = schemas.find((_: SchemaV2) => _._id === connectResource)

      // 后台获取 Schema
      if (!schema) {
        const { data } = await getSchema(projectId, connectResource)
        schema = data
      }

      const { data } = await getContents(projectId, schema.collectionName, {
        page: 1,
        pageSize: 1000,
      })

      setRecords(data)
      setLoading(false)
    },
    {
      // 根据连接的 schemaId 缓存
      cacheKey: connectResource,
      onError: (e) => {
        message.error(e.message || '获取数据错误')
        setLoading(false)
      },
    }
  )

  return (
    <Select
      loading={loading}
      disabled={loading}
      placeholder="关联字段"
      value={value?._id}
      onChange={onChange}
      mode={connectMany ? 'multiple' : undefined}
      style={{ width: '200px' }}
    >
      {loading ? (
        <Option value={value?._id}>加载中</Option>
      ) : records?.length ? (
        records?.map((record: Record<string, any>) => (
          <Option value={record._id} key={record._id}>
            {record[connectField]}
          </Option>
        ))
      ) : (
        <Option value="" disabled>
          空
        </Option>
      )}
    </Select>
  )
}
