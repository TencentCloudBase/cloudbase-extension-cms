import _ from 'lodash'
import { UnauthorizedOperation } from '@/common'

// 校验项目访问权限
// 返回可访问的资源
export const checkAccessAndGetResource = (
  projectId: string,
  req: IRequest,
  resourceId?: string
) => {
  const { projectResource } = req.cmsUser

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

  return validResource.includes('*') ? '*' : validResource
}
