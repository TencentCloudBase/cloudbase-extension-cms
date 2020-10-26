import { Module } from '@nestjs/common'
import { ApiController } from './api.controller'
import { UserService } from './api.service'

@Module({
  controllers: [ApiController],
  providers: [UserService],
})
export class ApiModule {}
