import { tcbRequest } from '@/utils'

export async function getSchemas(projectId?: string) {
    return tcbRequest('/api/schema', {
        method: 'GET',
        params: {
            projectId,
        },
    })
}

export async function getSchema(projectId: string, schemaId: string) {
    return tcbRequest(`/api/schema/${schemaId}`, {
        method: 'GET',
        params: {
            projectId,
        },
    })
}

export async function createSchema(schema: Partial<SchemaV2>) {
    return tcbRequest('/api/schema', {
        method: 'POST',
        data: schema,
    })
}

export async function updateSchema(schemaId: string, schema: Partial<SchemaV2>) {
    return tcbRequest(`/api/schema/${schemaId}`, {
        method: 'PUT',
        data: schema,
    })
}

export async function deleteSchema(schemaId: string, deleteCollection: boolean) {
    return tcbRequest(`/api/schema/${schemaId}`, {
        method: 'DELETE',
        data: {
            deleteCollection,
        },
    })
}
