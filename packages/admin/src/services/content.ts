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
  return tcbRequest(`/projects/${projectId}/contents`, {
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

export async function batchDeleteContent(projectId: string, resource: string, ids: string[]) {
  return tcbRequest(`/projects/${projectId}/contents`, {
    method: 'POST',
    data: {
      resource,
      options: {
        filter: {
          ids,
        },
      },
      action: 'deleteMany',
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

export async function getMigrateJobs(projectId: string, page = 1, pageSize = 10) {
  return tcbRequest(`/projects/${projectId}/migrate`, {
    method: 'GET',
    params: {
      page,
      pageSize,
    },
  })
}

export async function createMigrateJobs(
  projectId: string,
  collectionName: string,
  filePath: string,
  conflictMode: string
) {
  return tcbRequest(`/projects/${projectId}/migrate`, {
    method: 'POST',
    data: {
      filePath,
      projectId,
      conflictMode,
      collectionName,
    },
  })
}
