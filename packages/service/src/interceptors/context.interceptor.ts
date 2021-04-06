import { Observable } from 'rxjs'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 超时处理
    const request: IRequest = context.switchToHttp().getRequest()

    const { userRoles } = request.cmsUser || {}

    // 无角色信息，跳过，防止覆盖默认的 projectResource
    if (!userRoles?.length) {
      return next.handle()
    }

    // 挂载用户可访问资源信息
    request.cmsUser.accessibleService = userRoles
      .map((role) => role.permissions)
      .reduce((ret, current) => [...ret, ...current], [])
      .map((permission) => permission.service)

    /**
     * 至此，已经校验过服务和相关的操作，剩下的只需要校验具体的 projectId 和 resource 即可
     * 按项目 ID 聚合，用户可访问的资源
     * Permission 对象
     * {
     *    projectId: '*' | string
     *    行为
     *    action: string[] | ['*']
     *    effect: 'allow' | 'deny'
     *    服务，schema/content/webhook
     *    service: string | '*'
     *    具体资源
     *    resource: string[] | ['*']
     * }
     * 1. 从用户绑定的角色列表中取出所有 permission 规则
     * 2. 过滤出对当前路由（服务）起作用的 permissions 规则，并展开数组
     * 3. 按照项目 ID，聚合为一个 projectId: [resource] 映射对象
     *    {
     *       projectId: [resourceId]
     *    }
     */
    const projectResource = userRoles
      .map((role) => role.permissions)
      .filter((permissions) =>
        permissions?.filter((_) => _.service === '*' || request.handleService === _.service)
      )
      .reduce((ret, current) => [...ret, ...current], [])
      .map((permission) => [permission.projectId, permission.resource])
      .reduce((ret: Record<string, any>, current: [string, string[]]) => {
        if (ret[current[0]]) {
          ret[current[0]].push(...current[1])
        } else {
          ret[current[0]] = [...current[1]]
        }

        return ret
      }, {})

    // 权限
    request.cmsUser.projectResource = projectResource

    return next.handle()
  }
}
