import { Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello()
  }

  @Post()
  getStatus(): Promise<string> {
    return this.appService.getHello()
  }
}
