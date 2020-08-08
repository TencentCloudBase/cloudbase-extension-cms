import { request } from 'umi'

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

export const getWebhooks = async (options?: Partial<Options>) => {
    return request('/api/webhook', {
        method: 'POST',
        data: {
            action: 'getMany',
            options,
        },
    })
}

export const createWebhook = async (options?: Partial<Options>) => {
    return request('/api/webhook', {
        method: 'POST',
        data: {
            action: 'createOne',
            options,
        },
    })
}

export const updateWebhook = async (options?: Partial<Options>) => {
    return request('/api/webhook', {
        method: 'POST',
        data: {
            action: 'updateOne',
            options,
        },
    })
}

export const deleteWebhook = async (options?: Partial<Options>) => {
    return request('/api/webhook', {
        method: 'POST',
        data: {
            action: 'deleteOne',
            options,
        },
    })
}
