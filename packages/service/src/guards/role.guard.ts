import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Collection, SystemUserRoles, SYSTEM_ROLE_IDS } from '@/constants'
import { getCloudBaseApp } from '@/utils'

// 校验、并挂载用户角色信息
@Injectable()
export class GlobalRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequest>()

    const { cmsUser } = request

    const user = request.cmsUser

    if (!user?.roles?.length) {
      return false
    }

    // 系统管理员，全部可以访问
    const isAdmin = user.roles.find((roleId) => roleId === SYSTEM_ROLE_IDS.ADMIN)
    if (isAdmin) {
      request.cmsUser.userRoles = []
      request.cmsUser.isAdmin = true
      request.cmsUser.projectResource = {
        '*': '*',
      }
      return true
    }

    // 项目管理员可以访问项目内的资源
    const isProjectAdmin = user.roles.find((roleId) => roleId === SYSTEM_ROLE_IDS.PROJECT_ADMIN)
    if (isProjectAdmin) {
      request.cmsUser.userRoles = []
      request.cmsUser.isProjectAdmin = true
      request.cmsUser.projectResource = {
        '*': '*',
      }
      return true
    }

    const app = getCloudBaseApp()
    const db = app.database()

    // 查询用户的所有角色信息
    const { data: userRoles }: { data: UserRole[] } = await db
      .collection(Collection.CustomUserRoles)
      .where({
        _id: db.command.in(cmsUser.roles),
      })
      .limit(1000)
      .get()

    // 内容管理员，添加内容访问权限
    const isContentAdmin = cmsUser.roles.find((roleId) => roleId === SYSTEM_ROLE_IDS.CONTENT_ADMIN)
    if (isContentAdmin) {
      userRoles.push(SystemUserRoles[2])
    }

    cmsUser.userRoles = userRoles

    return true
  }
}
