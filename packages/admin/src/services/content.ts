import { request } from 'umi'

type Actions =
    | 'getOne'
    | 'getMany'
    | 'create'
    | 'updateOne'
    | 'updateMany'
    | 'deleteOne'
    | 'deleteMany'

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

    payload?: Record<string, any>
}

export async function getContents(resource: string, options?: Options) {
    return request('/api/content', {
        method: 'POST',
        data: {
            resource,
            options,
            action: 'getMany'
        }
    })
}

export async function createContent(resource: string, payload: Record<string, any>) {
    return request('/api/content', {
        method: 'POST',
        data: {
            resource,
            action: 'createOne',
            options: {
                payload
            }
        }
    })
}

export async function deleteContent(resource: string, id: string) {
    return request('/api/content', {
        method: 'POST',
        data: {
            resource,
            options: {
                filter: {
                    _id: id
                }
            },
            action: 'deleteOne'
        }
    })
}

export async function updateContent(resource: string, id: string, payload: Record<string, any>) {
    return request('/api/content', {
        method: 'POST',
        data: {
            resource,
            options: {
                payload,
                filter: {
                    _id: id
                }
            },
            action: 'updateOne'
        }
    })
}
