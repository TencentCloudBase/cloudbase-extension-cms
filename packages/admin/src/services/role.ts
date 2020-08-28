import { tcbRequest } from '@/utils'

export const getUserRoles = async () => {
  return tcbRequest('/roles', {
    method: 'GET',
    params: {},
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
