import { tcbRequest } from '@/utils'

export async function createBatchTask(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/createBatchTask`, {
    method: 'POST',
    data,
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
