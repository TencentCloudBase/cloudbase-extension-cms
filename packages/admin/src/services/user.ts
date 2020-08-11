import { tcbRequest } from '@/utils'

export async function query() {
    return tcbRequest<API.CurrentUser[]>('/api/users')
}

export async function queryCurrent() {
    return tcbRequest<API.CurrentUser>('/api/auth/currentUser', {
        method: 'POST',
    })
}

export async function queryNotices(): Promise<any> {
    return tcbRequest<{ data: API.NoticeIconData[] }>('/api/notices')
}

export const getUsers = async (projectId?: string) => {
    return tcbRequest('/api/user', {
        method: 'GET',
        params: {
            projectId,
        },
    })
}

export const createUser = async (user: Record<string, string>) => {
    return tcbRequest('/api/user', {
        method: 'POST',
        data: user,
    })
}

export const updateUser = async (id: string, payload: Record<string, string>) => {
    return tcbRequest(`/api/user/${id}`, {
        method: 'PUT',
        data: payload,
    })
}

export const deleteUser = async (userId: string) => {
    return tcbRequest(`/api/user/${userId}`, {
        method: 'DELETE',
    })
}

export interface Options {
    page?: number
    pageSize?: number

    filter?: {
        _id?: string
        ids?: string[]
        [key: string]: any
    }

    fuzzyFilter?: {
        [key: string]: string
    }

    sort?: {
        [key: string]: 'ascend' | 'descend'
    }

    payload: Record<string, any>
}

export const getCamPolicies = async (options?: Partial<Options>) => {
    return tcbRequest('/api/cam', {
        method: 'POST',
        data: {
            action: 'getMany',
            options,
        },
    })
}

export const createCamPolicy = async (options?: Partial<Options>) => {
    return tcbRequest('/api/can', {
        method: 'POST',
        data: {
            action: 'createOne',
            options,
        },
    })
}

export const updateCamPolicy = async (options?: Partial<Options>) => {
    return tcbRequest('/api/cam', {
        method: 'POST',
        data: {
            action: 'updateOne',
            options,
        },
    })
}

export const deleteCamPolicy = async (options?: Partial<Options>) => {
    return tcbRequest('/api/cam', {
        method: 'POST',
        data: {
            action: 'deleteOne',
            options,
        },
    })
}
