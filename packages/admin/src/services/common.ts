import { tcbRequest } from '@/utils'

export const getCollectionInfo = async (customId: string, collectionName: string) => {
  return tcbRequest('/collectionInfo', {
    method: 'POST',
    data: {
      customId,
      collectionName,
    },
  })
}
