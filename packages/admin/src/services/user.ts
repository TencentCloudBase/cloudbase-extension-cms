import { tcbRequest } from '@/utils'

export async function query() {
  return tcbRequest<API.CurrentUser[]>('/users')
}

export async function queryCurrent() {
  return tcbRequest<API.CurrentUser>('/auth/currentUser', {
    method: 'POST',
  })
}

export async function queryNotices(): Promise<any> {
  return tcbRequest<{ data: API.NoticeIconData[] }>('/notices')
}

export const getUsers = async (page = 1, pageSize = 10) => {
  return tcbRequest('/user', {
    method: 'GET',
    params: {
      page,
      pageSize,
    },
  })
}

export const createUser = async (user: Record<string, string>) => {
  return tcbRequest('/user', {
    method: 'POST',
    data: user,
  })
}

export const updateUser = async (id: string, payload: Record<string, string>) => {
  return tcbRequest(`/user/${id}`, {
    method: 'PATCH',
    data: payload,
  })
}

export const deleteUser = async (userId: string) => {
  return tcbRequest(`/user/${userId}`, {
    method: 'DELETE',
  })
}
