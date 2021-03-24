import { tcbRequest } from '@/utils'

/**
 * 获取全局设置
 */
export const getSetting = async (): Promise<{
  data: GlobalSetting
}> => {
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

/**
 * 创建微应用
 */
export const createMicroApp = async (data: MicroApp) => {
  return tcbRequest('/setting/createMicroApp', {
    data,
    method: 'POST',
  })
}

/**
 * 更新微应用
 */
export const updateMicroApp = async (data: MicroApp) => {
  return tcbRequest('/setting/updateMicroApp', {
    data,
    method: 'POST',
  })
}

/**
 * 删除微应用
 */
export const deleteMicroApp = async (data: MicroApp) => {
  return tcbRequest('/setting/deleteMicroApp', {
    data,
    method: 'POST',
  })
}
