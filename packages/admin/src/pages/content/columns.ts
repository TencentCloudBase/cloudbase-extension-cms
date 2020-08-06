import { getFieldRender } from './Components'
import { ProColumns } from '@ant-design/pro-table'

type DateTime = 'dateTime' | 'textarea'

const TypeWidthMap = {
    String: 150,
    MultiLineString: 150,
    Number: 120,
    Boolean: 100,
    DateTime: 150,
    File: 150,
    Image: 150,
    RichText: 200,
    Markdown: 200
}

export const createColumns = (fields: SchemaFieldV2[] = []): ProColumns[] => {
    const columns: ProColumns[] = fields
        ?.filter((_) => _)
        .map((field) => {
            const { name, type, displayName } = field

            const valueType: DateTime = type === 'DateTime' ? 'dateTime' : 'textarea'

            const render = getFieldRender(field)

            const nameWidth = displayName.length * 25

            // 计算列宽度
            let width
            if (TypeWidthMap[type]) {
                width = nameWidth > TypeWidthMap[type] ? nameWidth : TypeWidthMap[type]
            } else {
                width = nameWidth > 150 ? nameWidth : 150
            }

            return {
                render,
                width,
                valueType,
                sorter: true,
                align: 'center',
                dataIndex: name,
                title: displayName,
                hideInTable: field.isHidden,
                hideInSearch: field.isHidden
            }
        })
    return columns
}
