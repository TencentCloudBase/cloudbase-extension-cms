import { mixin, Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2, SystemUserRoles } from '@/constants'

// 合法操作
const ALLOW_ACTIONS = ['get', 'update', 'create', 'delete']

@Injectable()
class MixinPermissionGuard implements CanActivate {
    // 可以访问路由的角色
    protected readonly needRoles: string[]
    // 可以访问路由的服务权限
    protected readonly handleService: string

    constructor(private readonly cloudbaseService?: CloudBaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: AuthRequest = context.switchToHttp().getRequest()

        request.handleService = this.handleService

        // 访问路由需要管理员权限
        const needAdmin = this.needRoles?.find((roleId) => roleId === 'administrator')

        const user = request.cmsUser

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

        // 内容管理员，添加内容访问权限
        const isContentAdmin = user.roles.find((roleId) => roleId === 'content:administrator')
        if (isContentAdmin) {
            userRoles.push(SystemUserRoles[2])
        }

        // 是否允许访问服务
        const allowService = userRoles.find((role) =>
            role.permissions.find((_) => _.service === '*' || _.service === this.handleService)
        )

        if (!allowService) {
            return false
        }

        // 是否允许操作
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
