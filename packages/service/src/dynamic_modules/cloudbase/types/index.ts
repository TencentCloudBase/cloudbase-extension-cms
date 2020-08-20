export interface CloudBaseConfig {
  envId?: string
  env?: string
  debug?: boolean
  timeout?: number
  secretId?: string
  secretKey?: string
  sessionToken?: string
  proxy?: string
  credentials?: {
    private_key_id: string
    private_key: string
    env_id?: string
  }
}
