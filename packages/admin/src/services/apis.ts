import request from 'umi-request'
import { getAuthHeader, getHttpAccessPath, tcbRequest } from '@/utils'

interface ApiRequestPayload {
  service: 'util' | 'file' | 'setting' | 'auth'
  action: string
  [key: string]: any
}

export const apiRequest = <T>(data: ApiRequestPayload) => {
  return tcbRequest<T>('/', {
    data,
    method: 'POST',
  })
}

/**
 * 获取当前登录的用户信息
 * @param file
 */
export async function getCurrentUser() {
  return apiRequest<CurrentUser>({
    service: 'auth',
    action: 'getCurrentUser',
  })
}

/**
 * 上传文件到静态网站托管
 */
export const uploadFilesToHosting = (file: File, filePath: string) => {
  const formData = new FormData()
  formData.append('filePath', filePath)
  formData.append('file', file)

  const url = getHttpAccessPath()
  const authHeader = getAuthHeader()

  return request(`${url}/upload/hosting`, {
    data: formData,
    method: 'POST',
    headers: authHeader,
  })
}

/**
 * 获取集合信息
 */
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
