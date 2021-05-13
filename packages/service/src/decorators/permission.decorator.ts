import { SetMetadata } from '@nestjs/common'

export const Roles = (...roles: string[]) => SetMetadata('Roles', roles)

/**
 * 通用 API Service 权限
 * modules apis
 */
export const API_METADATA_KEY = 'API_SERVICE_ROLE'

export const ApiServiceRole = (...roles: string[]) => SetMetadata('API_SERVICE_ROLE', roles)
