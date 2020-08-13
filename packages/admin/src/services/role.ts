import { tcbRequest } from '@/utils'

export const getUserRoles = async () => {
    return tcbRequest('/api/role', {
        method: 'GET',
        params: {},
    })
}

export const createUserRole = async (role: any) => {
    return tcbRequest('/api/role', {
        method: 'POST',
        data: role,
    })
}

// export const updateCamPolicy = async (options?: Partial<Options>) => {
//     return tcbRequest('/api/cam', {
//         method: 'POST',
//         data: {
//             action: 'updateOne',
//             options,
//         },
//     })
// }

export const deleteUserRole = async (id: string) => {
    return tcbRequest(`/api/role/${id}`, {
        method: 'DELETE',
    })
}
