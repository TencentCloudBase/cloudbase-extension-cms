import { request } from 'umi'

export interface LoginParamsType {
    username: string
    password: string
    mobile: string
    captcha: string
    type: string
}

export async function accountLogin(params: LoginParamsType) {
    return request<API.LoginStateType>('/api/auth/login', {
        method: 'POST',
        data: params
    })
}

export async function outLogin() {
    return request('/api/auth/login')
}

export async function getFakeCaptcha(mobile: string) {
    return request(`/api/login/captcha?mobile=${mobile}`)
}
