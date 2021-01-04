import _ from 'lodash'
import { UnauthorizedOperation } from '@/common'

// 校验项目访问权限
// 返回可访问的资源
export const checkAccessAndGetResource = (context: {
  projectId: string
  req: IRequest
  action: string
  resourceId?: string
}) => {
  const { projectId, req, action: handleAction, resourceId } = context
  const { projectResource, isAdmin, isProjectAdmin, userRoles } = req.cmsUser

  // projectResource 为空，无权限
  if (_.isEmpty(projectResource)) {
    throw new UnauthorizedOperation('您没有此资源的访问权限')
  }

  // 所有可访问的项目 id
  const allProjectIds = Object.keys(projectResource)
  const validProjectIds = allProjectIds.filter(
    (project) => project === '*' || project === projectId
  )

  if (!validProjectIds?.length) {
    throw new UnauthorizedOperation('您没有此项目的访问权限')
  }

  // 获取全部可访问资源
  const validResource = []
  validProjectIds
    .map((id) => projectResource[id])
    .forEach((resources) => {
      if (resources === '*') {
        validResource.push('*')
      } else {
        validResource.push(...resources)
      }
    })

  if (resourceId && !validResource.find((_) => _ === '*' || _ === resourceId)) {
    throw new UnauthorizedOperation('您没有此资源的访问权限')
  }

  // 校验角色设置定的资源、action 与当前是否相符
  if (resourceId) {
    const validAction =
      isAdmin ||
      isProjectAdmin ||
      userRoles.find((role) => {
        const validPermissions = role.permissions
          .filter(
            (permission) =>
              permission.resource.includes('*') || permission.resource.includes(resourceId as any)
          )
          .filter((permission) => {
            // console.log(permission)
            return permission.action.find(
              (_) =>
                // 全部 action
                _ === '*' ||
                // action 为 update，处理 action 为 set
                (_ === 'update' && /^set/.test(handleAction)) ||
                // 其他 action 完全对应的情况
                new RegExp(_).test(handleAction)
            )
          })

        return validPermissions?.length
      })

    if (!validAction) {
      throw new UnauthorizedOperation('您没有此资源的访问权限')
    }
  }

  return validResource.includes('*') ? '*' : validResource
}
