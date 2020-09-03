import {
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Patch,
} from '@nestjs/common'
import _ from 'lodash'
import { PermissionGuard } from '@/guards'
import { CollectionV2 } from '@/constants'
import { IsNotEmpty } from 'class-validator'
import { dateToNumber } from '@/utils'
import { CloudBaseService } from '@/services'
import { RecordExistException, RecordNotExistException, UnauthorizedOperation } from '@/common'
import { UserService } from './user.service'

class User {
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

@UseGuards(PermissionGuard('user', ['administrator']))
@Controller('user')
export class UserController {
  constructor(
    private readonly cloudbaseService: CloudBaseService,
    private readonly userService: UserService
  ) {}

  // 获取所有用户
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getUsers(@Query() query: { page?: number; pageSize?: number } = {}) {
    const { page = 1, pageSize = 20 } = query

    let { data, requestId } = await this.cloudbaseService
      .collection(CollectionV2.Users)
      .where({})
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    data = data.map((_) => ({
      ..._,
      username: _.username,
    }))

    return {
      data,
      requestId,
    }
  }

  // 创建用户
  @Post()
  async createUser(@Body() body: User) {
    // 检查同名用户是否存在
    const { data } = await this.cloudbaseService
      .collection(CollectionV2.Users)
      .where({
        username: body.username,
      })
      .get()

    if (data?.length) {
      throw new RecordExistException('同名用户已存在')
    }

    // 注册用户
    const { username, password } = body
    const { UUId } = await this.userService.createUser(username, password)

    body.createTime = dateToNumber()

    return this.cloudbaseService.collection(CollectionV2.Users).add({
      ...body,
      uuid: UUId,
    })
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() payload: Partial<User>) {
    const query = this.collection().doc(id)
    const {
      data: [userInfo],
    } = await query.get()

    if (!userInfo) {
      throw new RecordNotExistException('用户不存在')
    }

    if (userInfo.root) {
      throw new UnauthorizedOperation('无法操作超级管理员')
    }

    // 修改用户名或密码
    const { username, password } = payload
    if (password || username) {
      await this.userService.updateUserInfo(userInfo.uuid, {
        password,
        username,
      })
    }

    // 不存储密码
    const user = _.omit(payload, ['password'])
    return query.update(user)
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId) {
    const {
      data: [user],
    } = await this.collection().doc(userId).get()

    if (!user) {
      throw new RecordNotExistException('用户不存在')
    }

    if (user.root) {
      throw new UnauthorizedOperation('无法操作超级管理员')
    }

    // 删除用户
    const deleteRes = await this.userService.deleteUser(user.uuid)
    console.log('删除用户', deleteRes)

    return this.collection().doc(userId).remove()
  }

  private collection(name = CollectionV2.Users) {
    return this.cloudbaseService.collection(name)
  }
}
