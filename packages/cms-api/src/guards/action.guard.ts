import { CmsException, ErrorCode, UnauthorizedOperation } from '@/common'
import { Collection } from '@/constants'
import { getCloudBaseApp } from '@/utils'
import { CanActivate, Injectable, ExecutionContext, mixin } from '@nestjs/common'
import { Request } from 'express'

// 映射 action 和对应的权限控制字段
const ACTION_MAP = {
  read: 'readableCollections',
  modify: 'modifiableCollections',
  delete: 'deletableCollections',
}

@Injectable()
export class MixinActionGuard implements CanActivate {
  // 操作
  protected readonly action: 'read' | 'modify' | 'delete'

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest & Request>()

    // 数据库集合名
    const collectionName = request.params?.collectionName
    const app = getCloudBaseApp()
    const db = app.database()
    // 查询 collection 的信息
    const {
      data: [collection],
    } = await db
      .collection(Collection.Schemas)
      .where({
        collectionName,
      })
      .get()

    // 查询 collection 所属项目
    const {
      data: [project],
    }: { data: Project[] } = await db
      .collection(Collection.Projects)
      .doc(collection.projectId)
      .get()

    if (!this.action) {
      throw new CmsException(ErrorCode.ServerError, 'Missing Action')
    }

    // 校验 action 是否允许
    if (!project?.[ACTION_MAP[this.action]]?.includes(collectionName)) {
      throw new UnauthorizedOperation()
    }

    return true
  }
}

export const ActionGuard = (action: 'read' | 'modify' | 'delete') => {
  const guard = mixin(
    class extends MixinActionGuard {
      protected readonly action = action
    }
  )
  return guard
}
