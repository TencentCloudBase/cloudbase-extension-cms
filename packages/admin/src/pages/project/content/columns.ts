import { ProColumns } from '@ant-design/pro-table'
import { getFieldRender } from './components'

type DateTime = 'dateTime' | 'date' | 'textarea'

const TypeWidthMap = {
  String: 150,
  MultiLineString: 150,
  Number: 120,
  Boolean: 100,
  DateTime: 150,
  File: 150,
  Image: 150,
  RichText: 200,
  Markdown: 200,
}

const hideInSearchType = ['File', 'Image', 'Array', 'Date', 'DateTime']

export const getTableColumns = (fields: SchemaFieldV2[] = []): ProColumns[] => {
  const columns: ProColumns[] = fields
    ?.filter((_) => _)
    .map((field) => {
      const { name, type, displayName, isHidden } = field

      const valueType: DateTime =
        type === 'DateTime' ? 'dateTime' : type === 'Date' ? 'date' : 'textarea'

      const render = getFieldRender(field)

      // 计算列宽度
      const nameWidth = displayName.length * 25
      let width
      if (TypeWidthMap[type]) {
        width = nameWidth > TypeWidthMap[type] ? nameWidth : TypeWidthMap[type]
      } else {
        width = nameWidth > 150 ? nameWidth : 150
      }

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
        title: displayName,
        hideInTable: isHidden,
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
    })

  columns.push(
    {
      width: 150,
      sorter: true,
      filters: true,
      align: 'center',
      title: '创建时间 💻',
      hideInSearch: true,
      dataIndex: '_createTime',
      valueType: 'dateTime',
    },
    {
      width: 150,
      sorter: true,
      filters: true,
      dataIndex: '_updateTime',
      align: 'center',
      title: '更新时间 💻',
      hideInSearch: true,
      valueType: 'dateTime',
    }
  )

  return columns
}
