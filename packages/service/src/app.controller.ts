import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AppService } from './app.service'
import { CamGuard } from './guards/cam.guard'

@Controller()
@UseGuards(CamGuard)
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
