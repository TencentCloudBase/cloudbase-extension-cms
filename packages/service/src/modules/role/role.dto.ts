import { IsNotEmpty } from 'class-validator'

export class UserRole {
  // 角色名
  @IsNotEmpty()
  roleName: string

  // 角色描述
  @IsNotEmpty()
  description: string

  // 角色绑定的权限描述
  @IsNotEmpty()
  permissions: Permission[]
}

export class Permission {
  // 项目
  @IsNotEmpty()
  projectId: '*' | string

  // 行为
  @IsNotEmpty()
  action: string[] | ['*']

  // TODO: 允许访问/拒绝访问
  effect: 'allow' | 'deny'

  // 服务
  @IsNotEmpty()
  service: string | '*'

  // 具体资源
  @IsNotEmpty()
  resource: string[] | ['*']
}
