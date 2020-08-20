import { Controller, Post, Request } from '@nestjs/common'

@Controller('auth')
export class AuthController {
  @Post('currentUser')
  async getCurrentUser(@Request() req: AuthRequest) {
    const { cmsUser } = req

    return cmsUser
  }
}
