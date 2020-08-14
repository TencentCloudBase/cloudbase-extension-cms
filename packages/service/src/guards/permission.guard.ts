import {
    mixin,
    Injectable,
    CanActivate,
    HttpStatus,
    HttpException,
    ExecutionContext,
} from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2, SystemUserRoles } from '@/constants'

const SkipService = ['auth', 'project']
// 合法操作
const ALLOW_ACTIONS = ['get', 'update', 'create', 'delete']

@Injectable()
class MixinPermissionGuard implements CanActivate {
    // 可以访问路由的角色
    protected readonly allowRoles: string[]
    // 可以访问路由的服务权限
    protected readonly handleService: string

    constructor(private readonly cloudbaseService?: CloudBaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: AuthRequest = context.switchToHttp().getRequest()

        // 访问路由需要管理员权限
        const needAdmin = this.allowRoles?.find((roleId) => roleId === 'administrator')

        const user = request.cmsUser

        // 用户信息不存在
        if (!user) {
            throw new HttpException(
                {
                    code: 'AUTH_EXPIRED',
                    message: '用户不存在，请重新登录',
                },
                HttpStatus.FORBIDDEN
            )
        }

        if (!user?.roles?.length) {
            return false
        }

        // 系统管理员，全部可以访问
        const isAdmin = user.roles.find((roleId) => roleId === 'administrator')
        if (isAdmin) {
            request.cmsUser.isAdmin = true
            request.cmsUser.projectResource = {
                '*': '*',
            }
            return true
        }

        // 项目管理员可以访问项目内的资源
        const isProjectAdmin = user.roles.find((roleId) => roleId === 'project:administrator')
        if (isProjectAdmin && !needAdmin) {
            request.cmsUser.isProjectAdmin = true
            request.cmsUser.projectResource = {
                '*': '*',
            }
            return true
        }

        const handleAction = context.getHandler().name
        const $ = this.cloudbaseService.db.command

        // 查询用户的所有角色信息
        const { data: userRoles }: { data: UserRole[] } = await this.cloudbaseService
            .collection(CollectionV2.CustomUserRoles)
            .where({
                _id: $.in(user.roles),
            })
            .limit(1000)
            .get()

        // 内容管理员
        const isContentAdmin = user.roles.find((roleId) => roleId === 'content:administrator')
        if (isContentAdmin) {
            userRoles.push(SystemUserRoles[2])
        }

        // 挂载用户可访问资源信息
        request.cmsUser.accessibleService = userRoles
            .map((role) => role.permissions)
            .reduce((ret, current) => [...ret, ...current], [])
            .map((permission) => permission.service)

        // 需要管理员权限才能访问
        if (!isAdmin && needAdmin) {
            return false
        }

        // 是否允许访问服务
        const allowService = userRoles.find((role) =>
            role.permissions.find(
                (_) =>
                    _.service === '*' ||
                    _.service === this.handleService ||
                    SkipService.includes(this.handleService)
            )
        )

        if (!allowService) {
            return false
        }

        // 是否允许操作
        const allowAction = userRoles.find((role) =>
            role.permissions.find((_) => {
                if (SkipService.includes(this.handleService)) {
                    return true
                }

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

        console.log(allowAction)

        if (!allowAction) {
            return false
        }

        /**
         * 至此，已经校验过服务和相关的操作，剩下的只需要校验具体的 projectId 和 resource 即可
         * 按项目 Id 聚合，用户可访问的资源
         * Permission 对象
         * {
         *    projectId: '*' | string
         *    // 行为
         *    action: string[] | ['*']
         *    effect: 'allow' | 'deny'
         *    // 服务，schema/content/webhook
         *    service: string | '*'
         *    // 具体资源
         *    resource: string[] | ['*']
         * }
         * 1. 从用户绑定的角色列表中取出所有 permission 规则
         * 2. 过滤出对当前路由（服务）起作用的 permissions 规则，并展开数组
         * 3. 按照项目 Id，聚合为一个 projectId: [resource] 映射对象
         *    {
         *       projectId: [resourceId]
         *    }
         */
        const roleResource = userRoles
            .map((role) => role.permissions)
            .filter((permissions) =>
                permissions?.filter((_) => _.service === '*' || this.handleService === _.service)
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
        request.cmsUser.projectResource = roleResource
        return true
    }
}

export const PermissionGuard = (service: string, roles?: string[]) => {
    const guard = mixin(
        class extends MixinPermissionGuard {
            protected readonly allowRoles = roles
            protected readonly handleService = service
        }
    )
    return guard
}
