import _ from 'lodash'
import { Reflector } from '@nestjs/core'
import { Get, Post, Body, Controller, Req } from '@nestjs/common'
import { IsNotEmpty } from 'class-validator'
import { API_METADATA_KEY } from '@/decorators'
import { CmsException, UnauthorizedOperation } from '@/common'
import { checkRole } from '@/utils'
import { UtilService } from './util.service'
import { AuthService } from './auth.service'

type Service = 'util' | 'auth'

type Action = keyof UtilService | keyof AuthService

class RequestBody {
  // 合法的 service
  service: Service

  // 操作
  @IsNotEmpty()
  action: Action
}

@Controller()
export class ApisController {
  constructor(
    private reflector: Reflector,
    private readonly util: UtilService,
    private readonly auth: AuthService
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return 'Hello World! Powered by Nest & CloudBase!'
  }

  @Post()
  async handleServiceActions(@Req() request: IRequest, @Body() body: RequestBody) {
    const { service, action } = body

    console.log('Service 处理', service, action)

    const validServices = Object.keys(this)

    if (!validServices.includes(service)) {
      throw new CmsException('INVALID_SERVICE', '非法的 Service')
    }

    const data = _.omit(body, 'service', 'action')

    // 通过 service 和 action 调用方法
    const needRoles = this.reflector.get(API_METADATA_KEY, this[service][action])

    const allow = checkRole(request, needRoles || [])

    if (!allow) {
      throw new UnauthorizedOperation()
    }

    return this[service][action](data)
  }
}
