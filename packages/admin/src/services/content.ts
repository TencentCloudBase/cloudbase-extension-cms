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

    sort?: {
        [key: string]: 'ascend' | 'descend'
    }

    payload?: Record<string, any>
}

export async function getContents(resource: string, options: Options) {
    return request('/api/content', {
        method: 'POST',
        data: {
            resource,
            options,
            action: 'getMany'
        }
    })
}
