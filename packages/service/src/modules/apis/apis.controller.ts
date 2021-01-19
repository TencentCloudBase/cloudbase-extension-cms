import _ from 'lodash'
import { Get, Post, Body, Controller } from '@nestjs/common'
import { IsNotEmpty } from 'class-validator'
import { UtilService } from './util.service'
import { AuthService } from './auth.service'
import { CmsException } from '@/common'

class RequestBody {
  // 合法的 service
  service: string

  // 操作
  @IsNotEmpty()
  action: string
}

@Controller()
export class ApisController {
  constructor(private readonly util: UtilService, private readonly auth: AuthService) {}

  @Get()
  async getHello(): Promise<string> {
    return 'Hello World! Powered by Nest & CloudBase!'
  }

  @Post()
  async handleServiceActions(@Body() body: RequestBody) {
    const { service, action } = body

    console.log('Service 处理', service, action)

    const validServices = Object.keys(this)

    if (!validServices.includes(service)) {
      throw new CmsException('INVALID_SERVICE', '非法的 Service')
    }

    const data = _.omit(body, 'service', 'action')

    // 通过 service 和 action 调用方法
    return this[service][action](data)
  }
}
