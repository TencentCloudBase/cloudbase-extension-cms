import { tcbRequest } from '@/utils'

export const getCollectionInfo = async (collectionName: string) => {
  return tcbRequest('/collectionInfo', {
    method: 'POST',
    data: {
      collectionName,
    },
  })
}
