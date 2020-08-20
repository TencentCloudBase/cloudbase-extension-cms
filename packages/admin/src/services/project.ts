import { tcbRequest } from '@/utils'

export interface Project {
  _id: string

  name: string

  description: string

  // project cover image url
  cover?: string
}

export async function getProject(id: string) {
  return tcbRequest<{
    data: Project[]
  }>(`/project/${id}`, {
    method: 'GET',
  })
}

export async function getProjects() {
  return tcbRequest<{
    data: Project[]
  }>('/project', {
    method: 'GET',
  })
}

export async function createProject(payload: { name: string; description: string }) {
  return tcbRequest<{
    data: Project[]
  }>('/project', {
    method: 'POST',
    data: payload,
  })
}

export async function updateProject(id: string, payload: Partial<Project>) {
  return tcbRequest<{
    data: Project[]
  }>(`/project/${id}`, {
    method: 'PUT',
    data: payload,
  })
}

export async function deleteProject(id: string) {
  return tcbRequest<{
    data: Project[]
  }>(`/project/${id}`, {
    method: 'DELETE',
  })
}
