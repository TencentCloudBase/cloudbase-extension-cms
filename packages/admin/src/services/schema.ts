import { request } from 'umi'

export async function getSchemas(projectId: string) {
    return request('/api/schema', {
        method: 'GET',
        params: {
            projectId
        }
    })
}

export async function createSchema(schema: Partial<SchemaV2>) {
    return request('/api/schema', {
        method: 'POST',
        data: schema
    })
}

export async function updateSchema(schemaId: string, schema: Partial<SchemaV2>) {
    return request('/api/schema', {
        method: 'PUT',
        data: {
            schemaId,
            payload: schema
        }
    })
}
