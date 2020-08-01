import { getFieldRender } from './Components'
import { ProColumns } from '@ant-design/pro-table'

type DateTime = 'dateTime' | 'textarea'

export const createColumns = (fields: SchemaFieldV2[] = []): ProColumns[] => {
    const columns = fields.map((field) => {
        const { name, type, displayName } = field

        const valueType: DateTime = type === 'DateTime' ? 'dateTime' : 'textarea'

        const render = getFieldRender(field)

        return {
            render,
            valueType,
            sorter: true,
            dataIndex: name,
            title: displayName,
            hideInTable: field.isHidden,
            hideInSearch: field.isHidden
        }
    })

    return columns
}
