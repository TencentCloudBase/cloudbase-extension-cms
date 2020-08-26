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
  return tcbRequest(`/projects/${projectId}/contents/schemas`, {
    method: 'GET',
  })
}

export async function getContents(projectId: string, resource: string, options?: Options) {
  return tcbRequest(`/projects/${projectId}/contents`, {
    method: 'POST',
    data: {
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
  return tcbRequest(`/projects/${projectId}/contents`, {
    method: 'POST',
    data: {
      resource,
      action: 'createOne',
      options: {
        payload,
      },
    },
  })
}

export async function deleteContent(projectId: string, resource: string, id: string) {
  return tcbRequest(`/projects/${projectId}/contents`, {
    method: 'POST',
    data: {
      resource,
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
  return tcbRequest(`/projects/${projectId}/contents`, {
    method: 'POST',
    data: {
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
