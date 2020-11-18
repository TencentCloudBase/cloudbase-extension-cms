import { tcbRequest } from '@/utils'

export async function getProject(id: string) {
  return tcbRequest<{
    data: Project
  }>(`/projects/${id}`, {
    method: 'GET',
  })
}

export async function getProjects() {
  return tcbRequest<{
    data: Project[]
  }>('/projects', {
    method: 'GET',
  })
}

export async function createProject(payload: { name: string; description: string }) {
  return tcbRequest<{
    data: Project[]
  }>('/projects', {
    method: 'POST',
    data: payload,
  })
}

export async function updateProject(
  id: string,
  payload: Partial<Project> & { keepApiPath?: boolean }
) {
  return tcbRequest<{
    data: Project[]
  }>(`/projects/${id}`, {
    method: 'PATCH',
    data: payload,
  })
}

export async function deleteProject(id: string) {
  return tcbRequest<{
    data: Project[]
  }>(`/projects/${id}`, {
    method: 'DELETE',
  })
}
