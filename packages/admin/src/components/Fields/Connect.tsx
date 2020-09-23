import React, { useState } from 'react'
import { Typography, message, Space, Tag, Select } from 'antd'
import { useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { getSchema } from '@/services/schema'
import { getContents } from '@/services/content'

const { Option } = Select
const { Text } = Typography

interface Doc {
  _id: string
  [key: string]: any
}
type IConnectSingleValue = string | Doc
type IConnectMultiValue = string[] & Doc[]
type IConnectValue = IConnectSingleValue | IConnectMultiValue
type ISelectValue = string | string[]

/**
 * 关联渲染
 */
export const IConnectRender: React.FC<{
  value?: IConnectValue
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
  value?: IConnectValue
  field: SchemaFieldV2
  onChange?: (v: string | string[]) => void
}> = (props) => {
  const { projectId } = useParams<any>()
  const ctx = useConcent('content')
  const { value = [], onChange, field } = props
  const { connectField, connectResource, connectMany } = field

  // 加载关联的文档列表
  const [docs, setDocs] = useState<Doc[]>([])
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

      setDocs(data)
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

  const connectIds = transformConnectValues(value, connectMany)

  return (
    <Select<ISelectValue>
      loading={loading}
      disabled={loading}
      value={connectIds}
      onChange={onChange}
      placeholder="关联字段"
      style={{ width: '200px' }}
      mode={connectMany ? 'multiple' : undefined}
    >
      {loading ? (
        <Option value="">加载中</Option>
      ) : docs?.length ? (
        docs?.map((doc) => (
          <Option value={doc._id} key={doc._id}>
            {doc[connectField]}
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

// 将关联的数据转换成关联数据对应的 _id 数据
const transformConnectValues = (value: IConnectValue, connectMany: boolean): string | string[] => {
  if (connectMany) {
    return (value as IConnectMultiValue)
      .filter((_) => _)
      .map((_: any) => {
        return typeof _ === 'string' ? _ : _?._id
      })
  }

  return typeof value === 'string' ? value : (value as { _id: string; [key: string]: any })?._id
}
