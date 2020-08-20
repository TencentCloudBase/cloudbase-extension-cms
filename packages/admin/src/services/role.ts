import { tcbRequest } from '@/utils'

export const getUserRoles = async () => {
  return tcbRequest('/role', {
    method: 'GET',
    params: {},
  })
}

export const createUserRole = async (role: any) => {
  return tcbRequest('/role', {
    method: 'POST',
    data: role,
  })
}

// export const updateCamPolicy = async (options?: Partial<Options>) => {
//     return tcbRequest('/cam', {
//         method: 'POST',
//         data: {
//             action: 'updateOne',
//             options,
//         },
//     })
// }

export const deleteUserRole = async (id: string) => {
  return tcbRequest(`/role/${id}`, {
    method: 'DELETE',
  })
}
