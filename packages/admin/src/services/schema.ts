import { request } from 'umi'

export async function getSchemas(projectId: string) {
    const version = projectId === 'v1' ? '1.0' : '2.0'
    return request('/api/schema', {
        method: 'GET',
        params: {
            version
        }
    })
}

export interface Schema {
    id?: string
    fields?: any[]
    project_id?: string
    display_name?: string
    collection_name?: string
    is_required?: boolean
    is_hidden?: boolean
}

export async function createSchema(schema: Schema) {
    return request('/api/schema', {
        method: 'POST',
        data: schema
    })
}

export async function updateSchema(schema: Schema) {
    return request('/api/schema', {
        method: 'PUT',
        data: schema
    })
}
