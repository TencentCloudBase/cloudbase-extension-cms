import { tcbRequest } from '@/utils'

export const getSettings = async () => {
  return tcbRequest('/setting', {
    method: 'GET',
  })
}

export const updateSetting = async (payload: Record<string, string>) => {
  return tcbRequest('/setting', {
    method: 'PATCH',
    data: payload,
  })
}

export const getCollectionInfo = async (customId: string, collectionName: string) => {
  return tcbRequest('/', {
    method: 'POST',
    data: {
      customId,
      collectionName,
      service: 'util',
      action: 'getCollectionInfo',
    },
  })
}
