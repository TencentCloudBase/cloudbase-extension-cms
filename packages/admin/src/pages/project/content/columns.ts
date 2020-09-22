import { ProColumns } from '@ant-design/pro-table'
import { getFieldRender } from './components'
import { calculateFieldWidth } from './utils'

type DateTime = 'dateTime' | 'date' | 'textarea'

const hideInSearchType = ['File', 'Image', 'Array', 'Date', 'DateTime']

/**
 * 获取表格 column 渲染配置
 */
export const getTableColumns = (fields: SchemaFieldV2[] = []): ProColumns[] => {
  const columns: ProColumns[] = fields
    ?.filter((_) => _)
    .map((field) => {
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
