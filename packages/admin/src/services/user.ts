import { tcbRequest } from '@/utils'

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
