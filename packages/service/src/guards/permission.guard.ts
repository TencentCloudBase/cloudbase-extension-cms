import { Reflector } from '@nestjs/core'
import {
    mixin,
    Injectable,
    CanActivate,
    HttpStatus,
    HttpException,
    ExecutionContext,
} from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2 } from '@/constants'

export const ALLOW_ACTIONS = ['get', 'update', 'create', 'delete']

@Injectable()
class MixinPermissionGuard implements CanActivate {
    // 可以访问路由的角色
    protected readonly allowRoles: string[]
    // 可以访问路由的服务权限
    protected readonly handleService: string

    constructor(
        private readonly cloudbaseService?: CloudBaseService,
        private readonly reflector?: Reflector
    ) {}

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

        // 需要管理员权限才能访问
        if (!isAdmin && needAdmin) {
            return false
        }

        // 项目管理员可以访问项目内的资源
        const isProjectAdmin = user.roles.find((roleId) => roleId === 'project:administrator')
        if (isProjectAdmin && !needAdmin) {
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

        // 是否允许访问服务
        const allowService = userRoles.find((role) =>
            role.permissions.find((_) => _.service === '*' || _.service === this.handleService)
        )

        if (!allowService) {
            return false
        }

        // 是否允许操作
        const allowAction = userRoles.find((role) =>
            role.permissions.find(
                (_) =>
                    _.action.includes('*') ||
                    _.action.find(
                        (action) =>
                            new RegExp(action).test(handleAction) && ALLOW_ACTIONS.includes(action)
                    )
            )
        )

        if (!allowAction) {
            return false
        }

        // 按项目 Id 聚合，用户可访问的资源
        const roleResource = userRoles
            .filter((role) =>
                role.permissions?.filter(
                    (_) => _.service === '*' || this.handleService === _.service
                )
            )
            .map((role) => role.permissions)
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
