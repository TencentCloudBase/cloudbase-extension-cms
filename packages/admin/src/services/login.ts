import { tcbRequest } from '@/utils'

export interface LoginParamsType {
  username: string
  password: string
  mobile?: string
  captcha?: string
  type?: string
}

export async function getFakeCaptcha(mobile: string) {
  return tcbRequest(`/login/captcha?mobile=${mobile}`)
}
