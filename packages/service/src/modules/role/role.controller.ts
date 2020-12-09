import _ from 'lodash'

import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Patch } from '@nestjs/common'
import { Collection, SystemUserRoles, SYSTEM_ROLE_IDS } from '@/constants'
import { RecordExistException, RecordNotExistException } from '@/common'
import { CloudBaseService } from '@/services'
import { PermissionGuard } from '@/guards'
import { UserRole } from './role.dto'

@UseGuards(PermissionGuard('role', [SYSTEM_ROLE_IDS.ADMIN]))
@Controller('roles')
export class RoleController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get()
  async getUserRoles(@Query() query: { page?: number; pageSize?: number } = {}) {
    const { page = 1, pageSize = 10 } = query

    const { data, requestId } = await this.collection()
      .where({})
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data: [...data, ...SystemUserRoles],
      requestId,
    }
  }

  @Post()
  async createUserRole(@Body() body: UserRole) {
    // 检查集合是否存在
    const {
      data: [record],
    } = await this.collection()
      .where({
        roleName: body.roleName,
      })
      .get()

    if (record) {
      throw new RecordExistException()
    }

    const role = _.omit(body, ['_id'])

    role.permissions.forEach((role) => {
      if (!role.effect) {
        role.effect = 'allow'
      }
    })

    return this.collection().add(role)
  }

  @Patch(':id')
  async updateUserRole(@Param('id') roleId, @Body() body: UserRole) {
    // 检查集合是否存在
    const {
      data: [record],
    } = await this.collection().doc(roleId).get()

    if (!record) {
      throw new RecordNotExistException()
    }

    const role = _.omit(body, ['_id'])

    role.permissions.forEach((role) => {
      if (!role.effect) {
        role.effect = 'allow'
      }
    })

    return this.collection().doc(roleId).update(role)
  }

  @Delete(':id')
  async deleteUserRole(@Param('id') id: string) {
    // 检查是否有用户绑定了此角色
    const $ = this.cloudbaseService.db.command
    const {
      data: [bindUser],
    } = await this.collection(Collection.Users)
      .where({
        roles: $.elemMatch($.eq(id)),
      })
      .get()
    if (bindUser) {
      throw new RecordExistException('存在用户绑定了此角色，无法删除此角色。请解绑用户角色后再操作')
    }

    return this.collection().doc(id).remove()
  }

  private collection(collection = Collection.CustomUserRoles) {
    return this.cloudbaseService.collection(collection)
  }
}
