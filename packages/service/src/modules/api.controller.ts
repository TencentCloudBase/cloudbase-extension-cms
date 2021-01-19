import _ from 'lodash'
import { Get, Post, Body, Controller } from '@nestjs/common'
import { IsIn, IsNotEmpty } from 'class-validator'
import { UtilService } from './util/util.service'

class RequestBody {
  // 合法的 service
  @IsIn(['util', 'file'])
  service: string

  // 操作
  @IsNotEmpty()
  action: string
}

@Controller()
export class ApiController {
  constructor(private readonly util: UtilService) {}

  @Get()
  async getHello(): Promise<string> {
    return 'Hello World! Powered by Nest & CloudBase!'
  }

  @Post()
  async handleServiceActions(@Body() body: RequestBody) {
    const { service, action } = body

    console.log('Service 处理', service, action)

    const data = _.omit(body, 'service', 'action')

    // 通过 service 和 action 调用方法
    return this[service][action](data)
  }
}
