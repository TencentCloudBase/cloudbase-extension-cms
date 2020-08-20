import { tcbRequest } from '@/utils'

export interface Options {
  page?: number
  pageSize?: number

  filter?: {
    _id?: string
    ids?: string[]
    [key: string]: any
  }

  fuzzyFilter?: {
    [key: string]: any
  }

  sort?: {
    [key: string]: 'ascend' | 'descend' | null
  }

  payload?: Record<string, any>
}

export async function getContentSchemas(projectId: string) {
  return tcbRequest('/content/schema', {
    method: 'GET',
    params: {
      projectId,
    },
  })
}

export async function getContents(projectId: string, resource: string, options?: Options) {
  return tcbRequest('/content', {
    method: 'POST',
    data: {
      projectId,
      options,
      resource,
      action: 'getMany',
    },
  })
}

export async function createContent(
  projectId: string,
  resource: string,
  payload: Record<string, any>
) {
  return tcbRequest('/content', {
    method: 'POST',
    data: {
      resource,
      projectId,
      action: 'createOne',
      options: {
        payload,
      },
    },
  })
}

export async function deleteContent(projectId: string, resource: string, id: string) {
  return tcbRequest('/content', {
    method: 'POST',
    data: {
      resource,
      projectId,
      options: {
        filter: {
          _id: id,
        },
      },
      action: 'deleteOne',
    },
  })
}

export async function updateContent(
  projectId: string,
  resource: string,
  id: string,
  payload: Record<string, any>
) {
  return tcbRequest('/content', {
    method: 'POST',
    data: {
      projectId,
      resource,
      options: {
        payload,
        filter: {
          _id: id,
        },
      },
      action: 'updateOne',
    },
  })
}
