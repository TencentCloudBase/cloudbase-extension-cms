import { tcbRequest } from '@/utils'

/**
 * 获取全局设置
 */
export const getSetting = async () => {
  return tcbRequest('/setting', {
    method: 'GET',
  })
}

/**
 * 更新全局设置
 */
export const updateSetting = async (payload: Partial<GlobalSetting>) => {
  return tcbRequest('/setting', {
    method: 'PATCH',
    data: payload,
  })
}
