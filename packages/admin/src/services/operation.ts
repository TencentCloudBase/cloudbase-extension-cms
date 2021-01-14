import { tcbRequest } from '@/utils'

export async function enableOperationService(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/enableOperationService`, {
    method: 'POST',
    data,
  })
}

export async function createBatchTask(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/createBatchTask`, {
    method: 'POST',
    data,
  })
}

export async function getOpenAPIToken(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/getOpenAPIToken`, {
    method: 'POST',
    data,
  })
}
