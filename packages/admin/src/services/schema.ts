import { tcbRequest } from '@/utils'

export async function getSchemas(projectId?: string): Promise<{ data: Schema[] }> {
  return tcbRequest(`/projects/${projectId}/schemas`, {
    method: 'GET',
  })
}

export async function getSchema(projectId: string, schemaId: string): Promise<{ data: Schema }> {
  return tcbRequest(`/projects/${projectId}/schemas/${schemaId}`, {
    method: 'GET',
  })
}

export async function createSchema(projectId: string, schema: Partial<Schema>) {
  return tcbRequest(`/projects/${projectId}/schemas`, {
    method: 'POST',
    data: schema,
  })
}

export async function updateSchema(projectId: string, schemaId: string, schema: Partial<Schema>) {
  return tcbRequest(`/projects/${projectId}/schemas/${schemaId}`, {
    method: 'PATCH',
    data: schema,
  })
}

export async function deleteSchema(projectId: string, schemaId: string, deleteCollection: boolean) {
  return tcbRequest(`/projects/${projectId}/schemas/${schemaId}`, {
    method: 'DELETE',
    data: {
      deleteCollection,
    },
  })
}
