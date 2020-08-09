import { tcbRequest } from '@/utils'

export interface LoginParamsType {
    username: string
    password: string
    mobile: string
    captcha: string
    type: string
}

export async function accountLogin(params: LoginParamsType) {
    return tcbRequest<API.LoginStateType>('/api/auth/login', {
        method: 'POST',
        data: params,
        skipErrorHandler: true,
    })
}

export async function outLogin() {
    return tcbRequest('/api/auth/login')
}

export async function getFakeCaptcha(mobile: string) {
    return tcbRequest(`/api/login/captcha?mobile=${mobile}`)
}
