import { callWxOpenAPI, tcbRequest } from '@/utils'

export async function enableOperationService(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/enableOperationService`, {
    data,
    method: 'POST',
  })
}

export async function createBatchTask(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/createBatchTask`, {
    data,
    method: 'POST',
  })
}

export async function enableNonLogin(projectId: string) {
  return tcbRequest(`/projects/${projectId}/operation/enableNonLogin`, {
    method: 'POST',
  })
}

export async function getAnalyticsData(data: { activityId: string }) {
  return callWxOpenAPI('getAnalyticsData', data)
}

export async function getRealtimeAnalyticsData(data: {
  activityId: string
  startTime: number
  endTime: number
  channelId: string
}) {
  return callWxOpenAPI('getRealtimeAnalyticsData', data)
}

export async function getSmsTaskResult(
  projectId: string,
  data: { queryId: string; pageSize: number; page: number }
) {
  return tcbRequest(`/projects/${projectId}/operation/getSmsTaskResult`, {
    data,
    method: 'POST',
  })
}

export async function getLowCodeAppInfo(projectId: string) {
  return tcbRequest(`/projects/${projectId}/operation/getLowCodeAppInfo`, {
    method: 'POST',
  })
}
