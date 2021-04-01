import React from 'react'
import { ProColumns } from '@ant-design/pro-table'
import { getFieldRender } from '@/components/Fields'
import {
  calculateFieldWidth,
  copyToClipboard,
  getSchemaCustomFields,
  getSchemaSystemFields,
} from '@/utils'
import ErrorBoundary from '@/components/ErrorBoundary'
import { message, Popconfirm, Space } from 'antd'

type DateTime = 'dateTime' | 'date' | 'textarea'

const hideInSearchType = ['File', 'Image', 'Array', 'Date', 'DateTime']

/**
 * 获取表格 column 渲染配置
 */
export const getTableColumns = (schema: Schema): ProColumns[] => {
  // 用户自定义字段，过滤掉系统字段，重复字段
  const customFields = getSchemaCustomFields(schema)?.filter(
    (field, i, arr) => field && arr.findIndex((_) => _.name === field.name) === i
  )

  const systemFields = getSchemaSystemFields(schema)
  const idFiled = systemFields.splice(0, 1)[0]

  // 将 _id 字段放到表格首列
  customFields.unshift(idFiled)
  // 将时间字段放到表格的末尾列
  customFields.push(...systemFields)

  const columns: ProColumns[] = customFields.map(fieldToColumn)

  return columns
}

/**
 * 根据 field 属性，生成 column 配置
 */
const fieldToColumn = (field: SchemaField) => {
  const { name, type, displayName, isHidden } = field

  const valueType: DateTime =
    type === 'DateTime' ? 'dateTime' : type === 'Date' ? 'date' : 'textarea'

  // 处理渲染错误
  const render = (text: React.ReactNode, record: any, index: number, action: any) => {
    const component = getFieldRender(field)(text, record, index, action)

    return (
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Popconfirm
            title={
              <div>
                异常信息（点击确认复制异常信息）：
                <p>{error?.message}</p>
              </div>
            }
            onConfirm={() => {
              copyToClipboard(error.message)
              message.success('复制错误信息成功')
            }}
          >
            <Space className="text-red-600 font-bold">❌ 数据异常</Space>
          </Popconfirm>
        )}
      >
        {component}
      </ErrorBoundary>
    )
  }

  // 计算列宽度，略大于计算宽度
  const width = calculateFieldWidth(field) + 10

  // 不支持搜索的字段类型
  const hideInSearch = hideInSearchType.includes(type) || isHidden

  const column: ProColumns = {
    width,
    // 不可搜索的字段
    hideInSearch,
    sorter: true,
    filters: true,
    align: 'center',
    dataIndex: name,
    hideInTable: isHidden,
    title: field.isSystem ? `${displayName} 💻` : displayName,
  }

  if (type === 'Enum') {
    column.valueEnum = field.enumElements.reduce(
      (ret, current) => ({
        [current.value]: current.label,
        ...ret,
      }),
      {}
    )
  } else {
    column.render = render
    column.valueType = valueType
  }

  return column
}
