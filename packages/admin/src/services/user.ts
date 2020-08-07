import { request } from 'umi'

export async function query() {
    return request<API.CurrentUser[]>('/api/users')
}

export async function queryCurrent() {
    return request<API.CurrentUser>('/api/auth/currentUser', {
        method: 'POST'
    })
}

export async function queryNotices(): Promise<any> {
    return request<{ data: API.NoticeIconData[] }>('/api/notices')
}

export const getUsers = async () => {
    return request('/api/user', {
        method: 'GET'
    })
}

export const createUser = async (user: Record<string, string>) => {
    return request('/api/user', {
        method: 'POST',
        data: user
    })
}

export const deleteUser = async (userId: string) => {
    return request(`/api/user/${userId}`, {
        method: 'DELETE'
    })
}
