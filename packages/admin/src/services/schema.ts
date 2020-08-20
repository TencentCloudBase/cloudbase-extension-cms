import { tcbRequest } from '@/utils'

export async function getSchemas(projectId?: string) {
  return tcbRequest('/schema', {
    method: 'GET',
    params: {
      projectId,
    },
  })
}

export async function getSchema(projectId: string, schemaId: string) {
  return tcbRequest(`/schema/${schemaId}`, {
    method: 'GET',
    params: {
      projectId,
    },
  })
}

export async function createSchema(schema: Partial<SchemaV2>) {
  return tcbRequest('/schema', {
    method: 'POST',
    data: schema,
  })
}

export async function updateSchema(schemaId: string, schema: Partial<SchemaV2>) {
  return tcbRequest(`/schema/${schemaId}`, {
    method: 'PUT',
    data: schema,
  })
}

export async function deleteSchema(schemaId: string, deleteCollection: boolean) {
  return tcbRequest(`/schema/${schemaId}`, {
    method: 'DELETE',
    data: {
      deleteCollection,
    },
  })
}
