import _ from 'lodash'
import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Patch } from '@nestjs/common'
import { Collection, SystemUserRoles, SYSTEM_ROLE_IDS } from '@/constants'
import { RecordExistException, RecordNotExistException } from '@/common'
import { getLimit, getSkip } from '@/utils'
import { CloudBaseService } from '@/services'
import { PermissionGuard } from '@/guards'
import { UserRole } from './role.dto'

@UseGuards(PermissionGuard('role', [SYSTEM_ROLE_IDS.ADMIN]))
@Controller('roles')
export class RoleController {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  @Get()
  async getUserRoles(@Query() query: { page?: number; pageSize?: number } = {}) {
    const offset = SystemUserRoles.length
    const { page = 1, pageSize = 10 } = query
    const pageNum = Number(page)
    const pageSizeNum = Number(pageSize)

    // 获取所有角色
    const roleQuery = this.collection().where({})
    const totalRes = await roleQuery.count()

    const pureSkip = getSkip(page, pageSize)
    // 当查询的数据范围小于、等于内置角色总量时，直接从内置角色中获取数据
    if (pageNum * pageSizeNum <= offset) {
      return {
        requestId: totalRes.requestId,
        total: totalRes.total + offset,
        data: SystemUserRoles.slice(pureSkip, pureSkip + pageSizeNum),
      }
    }

    // 查询的数据范围大于内置角色总量，从数据库中查询 + 补充内置角色数据
    const skip = getSkip(page, pageSize, offset)
    const limit = getLimit(page, pageSize, offset)

    // 从数据库中查询数据
    const { data, requestId } = await roleQuery.skip(skip).limit(limit).get()
    // 从系统内置角色中补充的数据
    const appendSystemUserRoles = SystemUserRoles.slice(pureSkip)

    return {
      requestId,
      total: totalRes.total + offset,
      // limit 小于 pageSize，说明需要从内置角色中加数据，反之不需要
      data: limit < pageSizeNum ? [...appendSystemUserRoles, ...data] : data,
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
