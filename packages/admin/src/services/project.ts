import { request } from 'umi'

export interface Project {
    _id: string

    name: string

    description: string

    // project cover image url
    cover?: string
}

export async function getProjects() {
    return request<{
        data: Project[]
    }>('/api/project', {
        method: 'GET'
    })
}

export async function createProject(payload: { name: string; description: string }) {
    return request<{
        data: Project[]
    }>('/api/project', {
        method: 'POST',
        data: payload
    })
}
