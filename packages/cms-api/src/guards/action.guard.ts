import { CmsException, ErrorCode, UnauthorizedOperation } from '@/common'
import { Collection } from '@/constants'
import { getCloudBaseApp } from '@/utils'
import { CanActivate, Injectable, ExecutionContext, mixin } from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class MixinActionGuard implements CanActivate {
  // 操作
  protected readonly action: 'read' | 'modify'

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

    if (this.action === 'read' && !project?.readableCollections?.includes(collectionName)) {
      throw new UnauthorizedOperation('你没有权限访问此数据')
    }

    if (this.action === 'modify' && !project?.modifiableCollections?.includes(collectionName)) {
      throw new UnauthorizedOperation('你没有权限修改此数据')
    }

    return true
  }
}

export const ActionGuard = (action: 'read' | 'modify') => {
  const guard = mixin(
    class extends MixinActionGuard {
      protected readonly action = action
    }
  )
  return guard
}
