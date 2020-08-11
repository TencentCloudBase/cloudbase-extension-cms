import { SetMetadata } from '@nestjs/common'

export type Role = 'administrator' | 'operator' | 'custom'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)
