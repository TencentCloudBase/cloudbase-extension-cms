import { mixin, Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { SYSTEM_ROLE_IDS } from '@/constants'

@Injectable()
class MixinPermissionGuard implements CanActivate {
  // 可以访问路由的角色
  protected readonly needRoles: string[]
  // 可以访问路由的服务权限
  protected readonly handleService: string

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: IRequest = context.switchToHttp().getRequest()

    request.handleService = this.handleService

    const {
      cmsUser: { isAdmin, isProjectAdmin, userRoles },
    } = request

    // 访问路由需要管理员权限
    const needAdmin = this.needRoles?.find((roleId) => roleId === SYSTEM_ROLE_IDS.ADMIN)

    if (isAdmin || (isProjectAdmin && !needAdmin)) {
      return true
    }

    if (!isAdmin && needAdmin) {
      return false
    }

    // 是否允许访问服务：查询用户所有角色、权限对应的服务，是否包含 handleService，如果不包含，则返回
    const allowService = userRoles.find((role) =>
      role.permissions.find((_) => _.service === '*' || _.service === this.handleService)
    )
    if (!allowService) {
      return false
    }

    // 根据 handleService 和 action 进一步判断是否允许操作
    // HACK: 使用 Service 的函数名作为 action 判断依据：get, create, update, delete, set
    let handleAction = context.getHandler().name
    // 部分 service 使用 handleAction
    if (handleAction === 'handleAction') {
      const body = request.body as any
      handleAction = body.action
    }

    // 用户绑定的角色，对应的权限
    const allowAction = userRoles.find((role) =>
      role.permissions.find((permission) => {
        // 服务需要对应
        // action 要合法
        if (permission.service !== '*' && permission.service !== this.handleService) return false

        // 全部 action
        if (permission.action.includes('*')) {
          return true
        }

        return permission.action.find(
          (action) =>
            // 全部 action
            action === '*' ||
            // action 为 update，处理 action 为 set
            (action === 'update' && /^set/.test(handleAction)) ||
            // 其他 action 完全对应的情况
            new RegExp(action).test(handleAction)
        )
      })
    )

    if (!allowAction) {
      return false
    }

    return true
  }
}

export const PermissionGuard = (service: string, roles?: SYSTEM_ROLE_IDS.ADMIN[]) => {
  const guard = mixin(
    class extends MixinPermissionGuard {
      protected readonly needRoles = roles
      protected readonly handleService = service
    }
  )
  return guard
}
