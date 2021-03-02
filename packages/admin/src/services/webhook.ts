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

  payload: Record<string, any>
}

export const getWebhooks = async (projectId: string, options?: Partial<Options>) => {
  return tcbRequest(`/projects/${projectId}/webhooks`, {
    method: 'POST',
    data: {
      options,
      action: 'getMany',
    },
  })
}

export const getWebhookLog = async (projectId: string, options?: Partial<Options>) => {
  return tcbRequest(`/projects/${projectId}/webhooks/log`, {
    method: 'POST',
    data: {
      options,
      action: 'getMany',
    },
  })
}

export const createWebhook = async (projectId: string, options?: Partial<Options>) => {
  return tcbRequest(`/projects/${projectId}/webhooks`, {
    method: 'POST',
    data: {
      options,
      action: 'createOne',
    },
  })
}

export const updateWebhook = async (projectId: string, options?: Partial<Options>) => {
  return tcbRequest(`/projects/${projectId}/webhooks`, {
    method: 'POST',
    data: {
      options,
      action: 'updateOne',
    },
  })
}

export const deleteWebhook = async (projectId: string, options?: Partial<Options>) => {
  return tcbRequest(`/projects/${projectId}/webhooks`, {
    method: 'POST',
    data: {
      options,
      action: 'deleteOne',
    },
  })
}
