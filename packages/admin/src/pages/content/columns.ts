import { getFieldRender } from './Components'
import { ProColumns } from '@ant-design/pro-table'

type DateTime = 'dateTime' | 'textarea'

const createColumnsV1 = (fields: SchemaFieldV1[]): ProColumns[] => {
    const columns = fields.map((field) => {
        const { fieldLabel, fieldName, fieldType } = field

        const valueType: DateTime = fieldType === 'DateTime' ? 'dateTime' : 'textarea'

        const render = getFieldRender({
            name: field.fieldName,
            type: field.fieldType
        })

        return {
            render,
            valueType,
            sorter: true,
            title: fieldLabel,
            dataIndex: fieldName,
            hidden: field.hidden,
            hideInSearch: field.hidden
        }
    })

    return columns
}

const createColumnsV2 = (fields: SchemaFieldV2[]): ProColumns[] => {
    const columns = fields.map((field) => {
        const { name, type, display_name } = field

        const valueType: DateTime = type === 'DateTime' ? 'dateTime' : 'textarea'

        const render = getFieldRender(field)

        return {
            render,
            valueType,
            sorter: true,
            dataIndex: name,
            title: display_name,
            hideInTable: field.is_hidden,
            hideInSearch: field.is_hidden
        }
    })

    return columns
}

export const createColumns = (schema: CompatibleSchema) => {
    if (!schema) return []
    return schema._version ? createColumnsV2(schema.fields) : createColumnsV1(schema.fields)
}
