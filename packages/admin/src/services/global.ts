import { tcbRequest } from '@/utils'

export const getSettings = async () => {
  return tcbRequest('/setting', {
    method: 'GET',
  })
}

export const updateSetting = async (payload: Partial<GlobalSetting>) => {
  return tcbRequest('/setting', {
    method: 'PATCH',
    data: payload,
  })
}
