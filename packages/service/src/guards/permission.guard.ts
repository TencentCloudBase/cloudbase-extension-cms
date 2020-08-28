import { mixin, Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

// 合法操作
const ALLOW_ACTIONS = ['get', 'update', 'create', 'delete']

@Injectable()
class MixinPermissionGuard implements CanActivate {
  // 可以访问路由的角色
  protected readonly needRoles: string[]
  // 可以访问路由的服务权限
  protected readonly handleService: string

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest()

    request.handleService = this.handleService

    const {
      cmsUser: { isAdmin, isProjectAdmin, userRoles },
    } = request

    // 访问路由需要管理员权限
    const needAdmin = this.needRoles?.find((roleId) => roleId === 'administrator')

    if (isAdmin || (isProjectAdmin && !needAdmin)) {
      return true
    }

    if (!isAdmin && needAdmin) {
      return false
    }

    // 是否允许访问服务
    const allowService = userRoles.find((role) =>
      role.permissions.find((_) => _.service === '*' || _.service === this.handleService)
    )
    if (!allowService) {
      return false
    }

    // 是否允许操作
    // HACK: 使用 Service 的函数名作为 action 判断依据：get, create, update, delete
    let handleAction = context.getHandler().name
    // 部分 service 使用 handleAction
    if (handleAction === 'handleAction') {
      const body = request.body as any
      handleAction = body.action
    }
    const allowAction = userRoles.find((role) =>
      role.permissions.find((_) => {
        if (_.service === this.handleService && _.action.includes('*')) {
          return true
        }

        return _.action.find(
          (action) =>
            ALLOW_ACTIONS.includes(action) &&
            (action === '*' || new RegExp(action).test(handleAction))
        )
      })
    )

    if (!allowAction) {
      return false
    }

    return true
  }
}

export const PermissionGuard = (service: string, roles?: 'administrator'[]) => {
  const guard = mixin(
    class extends MixinPermissionGuard {
      protected readonly needRoles = roles
      protected readonly handleService = service
    }
  )
  return guard
}
