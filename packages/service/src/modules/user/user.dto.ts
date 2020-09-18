import { IsNotEmpty } from 'class-validator'

export class User {
  @IsNotEmpty()
  username: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  roles: string[]

  // 创建时间
  createTime: number

  // 登陆失败次数
  failedLogins?: Record<string, number>[]
}
