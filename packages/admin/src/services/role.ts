import { tcbRequest } from '@/utils'

export const getUserRoles = async (page = 1, pageSize = 10) => {
  return tcbRequest('/roles', {
    method: 'GET',
    params: {
      page,
      pageSize,
    },
  })
}

export const createUserRole = async (role: any) => {
  return tcbRequest('/roles', {
    method: 'POST',
    data: role,
  })
}

export const updateUserRole = async (id: string, role: any) => {
  return tcbRequest(`/roles/${id}`, {
    method: 'PATCH',
    data: role,
  })
}

export const deleteUserRole = async (id: string) => {
  return tcbRequest(`/roles/${id}`, {
    method: 'DELETE',
  })
}
