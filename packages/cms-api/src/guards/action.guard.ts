import { CanActivate, Injectable, ExecutionContext, mixin, Inject } from '@nestjs/common'
import { CmsException, ErrorCode, UnauthorizedOperation } from '@/common'
import { LocalCacheService } from '@/services'

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

  constructor(@Inject('LocalCacheService') private readonly cacheService: LocalCacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequest>()
    // const res = context.switchToHttp().getResponse<IResponse>()

    // 数据库集合名
    const collectionName = req.params?.collectionName

    // 从缓存中读取 project
    const project = this.cacheService.get('project')

    if (!this.action) {
      throw new CmsException(ErrorCode.ServerError, 'Missing Action')
    }

    // 校验 action 是否允许
    // 兼容原项目中的设置，2.12.0+
    if (
      project?.[ACTION_MAP[this.action]]?.includes(collectionName) ||
      req.accessToken?.permissions?.includes(this.action)
    ) {
      return true
    }

    throw new UnauthorizedOperation()
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
