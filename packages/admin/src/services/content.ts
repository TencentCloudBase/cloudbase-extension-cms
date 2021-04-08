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

export async function getContentSchema(
  projectId: string,
  schemaId: string
): Promise<{ data: Schema }> {
  return tcbRequest(`/projects/${projectId}/contents/${schemaId}`, {
    method: 'GET',
  })
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

/**
 * 更新内容
 */
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

/**
 * 创建导入任务
 */
export async function createImportMigrateJob(
  projectId: string,
  data: {
    fileID: string
    filePath: string
    fileType: string
    collectionName: string
    conflictMode: string
  }
) {
  return tcbRequest(`/projects/${projectId}/migrate`, {
    data,
    method: 'POST',
  })
}

/**
 * 创建导出任务
 */
export async function createExportMigrateJob(
  projectId: string,
  data: {
    fileType: string
    collectionName: string
  }
) {
  return tcbRequest(`/projects/${projectId}/migrate/export`, {
    data,
    method: 'POST',
  })
}

/**
 * 请求解析 JSON Lines 文件
 */
export async function parseJsonLinesFile(projectId: string, fileUrl: string) {
  return tcbRequest(`/projects/${projectId}/migrate/parseJsonLinesFile`, {
    method: 'POST',
    data: {
      fileUrl,
    },
  })
}
