import {
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Controller,
  UseInterceptors,
  Patch,
  Request,
  UseGuards,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import _ from 'lodash'
import { PermissionGuard } from '@/guards'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'
import { dateToUnixTimestampInMs } from '@/utils'
import { CloudBaseService } from '@/services'
import { RecordExistException, RecordNotExistException, UnauthorizedOperation } from '@/common'
import { UserService } from './user.service'
import { User } from './user.dto'

@UseGuards(PermissionGuard('user', [SYSTEM_ROLE_IDS.ADMIN]))
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
    const { page = 1, pageSize = 10 } = query

    let { data, requestId } = await this.cloudbaseService
      .collection(Collection.Users)
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
      .collection(Collection.Users)
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

    body.createTime = dateToUnixTimestampInMs()

    // 不存储密码
    const user = _.omit(body, ['password'])

    return this.cloudbaseService.collection(Collection.Users).add({
      ...user,
      uuid: UUId,
    })
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() payload: Partial<User>,
    @Request() req: IRequest
  ) {
    const query = this.collection().doc(id)
    const {
      data: [userInfo],
    } = await query.get()

    if (!userInfo) {
      throw new RecordNotExistException('用户不存在')
    }

    // 只有 root 用户才能修改 root 用户的信息
    if (userInfo.root && !req.cmsUser.root) {
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

    // 不能更新空对象
    return _.isEmpty(user) ? {} : query.update(user)
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId) {
    const {
      data: [user],
    } = await this.collection().doc(userId).get()

    if (!user) {
      throw new RecordNotExistException('用户不存在')
    }

    // root 用户不能删除
    if (user.root) {
      throw new UnauthorizedOperation('无法操作超级管理员')
    }

    // 删除用户
    const deleteRes = await this.userService.deleteUser(user.uuid)
    console.log('删除用户', deleteRes)

    return this.collection().doc(userId).remove()
  }

  private collection(name = Collection.Users) {
    return this.cloudbaseService.collection(name)
  }
}
