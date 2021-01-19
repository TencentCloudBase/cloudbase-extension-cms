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
