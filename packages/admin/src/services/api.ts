import { tcbRequest } from '@/utils'

interface ApiRequestPayload {
  service: 'base' | 'file'
  action: string
  [key: string]: any
}

export const apiRequest = (data: ApiRequestPayload) => {
  return tcbRequest('/', {
    data,
    method: 'POST',
  })
}

export const uploadFilesToHosting = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return tcbRequest('/upload/hosting', {
    data: formData,
    method: 'POST',
  })
}
