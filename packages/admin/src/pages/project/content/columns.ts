import { ProColumns } from '@ant-design/pro-table'
import { getFieldRender } from '@/components/Fields'
import { calculateFieldWidth, getSchemaSystemFields } from '@/utils'

type DateTime = 'dateTime' | 'date' | 'textarea'

const hideInSearchType = ['File', 'Image', 'Array', 'Date', 'DateTime']

/**
 * 获取表格 column 渲染配置
 */
export const getTableColumns = (fields: SchemaField[] = []): ProColumns[] => {
  // 用户自定义字段，过滤掉系统字段，重复字段
  const customFields = fields
    ?.filter((_) => !_.isSystem)
    ?.filter((field, i, arr) => field && arr.findIndex((_) => _.name === field.name) === i)

  // 将系统字段放到表格的末尾列
  const columns: ProColumns[] = customFields.map(fieldToColumn)
  const systemFieldColumns = getSchemaSystemFields(fields).map(fieldToColumn)
  columns.push(...systemFieldColumns)

  // 插入序号列
  columns.unshift({
    title: '序号',
    width: 72,
    align: 'center',
    valueType: 'indexBorder',
    render: (
      text: React.ReactNode,
      record: any,
      index: number,
      action: any
    ): React.ReactNode | React.ReactNode[] => {
      const { current, pageSize } = action
      const serial = Number(pageSize) * (Number(current) - 1) + index + 1
      return serial
    },
  })

  return columns
}

/**
 * 根据 field 属性，生成 column 配置
 */
const fieldToColumn = (field: SchemaField) => {
  const { name, type, displayName, isHidden } = field

  const valueType: DateTime =
    type === 'DateTime' ? 'dateTime' : type === 'Date' ? 'date' : 'textarea'

  const render = getFieldRender(field)

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
