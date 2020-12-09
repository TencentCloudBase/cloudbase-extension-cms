import { Controller, Post, Request } from '@nestjs/common'

@Controller('auth')
export class AuthController {
  @Post('currentUser')
  async getCurrentUser(@Request() req: IRequest) {
    const { cmsUser } = req

    return cmsUser
  }
}
