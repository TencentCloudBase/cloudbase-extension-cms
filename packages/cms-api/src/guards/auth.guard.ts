import { Collection } from '@/constants'
import { LocalCacheService } from '@/services'
import { getCloudBaseApp, getCollectionSchema } from '@/utils'
import {
  CanActivate,
  HttpStatus,
  Injectable,
  HttpException,
  ExecutionContext,
  Inject,
} from '@nestjs/common'

@Injectable()
export class RequestAuthGuard implements CanActivate {
  constructor(@Inject('LocalCacheService') private readonly cacheService: LocalCacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequest>()

    // 数据库集合名
    const collectionName = req.params?.collectionName
    const app = getCloudBaseApp()
    const db = app.database()
    const schema = await getCollectionSchema(collectionName)

    // 首次查询、缓存 schema 信息
    this.cacheService.set('currentSchema', schema)

    // 集合非 CMS 管理的集合，禁止访问
    if (!schema) {
      throw new HttpException(
        {
          error: {
            code: 'NOT_FOUND_IN_CMS',
            message: '你访问的集合不存在',
          },
        },
        HttpStatus.FORBIDDEN
      )
    }

    // 查询项目
    const {
      data: [project],
    }: { data: Project[] } = await db.collection(Collection.Projects).doc(schema.projectId).get()

    if (!project) {
      throw new HttpException(
        {
          error: {
            code: 'NOT_FOUND',
            message: '项目不存在，无法访问',
          },
        },
        HttpStatus.FORBIDDEN
      )
    }

    // 缓存 project 信息
    this.cacheService.set('project', project)

    // 是否开启 API 访问
    if (!project.enableApiAccess) {
      throw new HttpException(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'API 访问未开启',
          },
        },
        HttpStatus.FORBIDDEN
      )
    }

    // 是否开启 API 访问
    if (!project.apiAccessPath) {
      throw new HttpException(
        {
          error: { code: 'NOT_FOUND', message: 'API 访问路径未设置' },
        },
        HttpStatus.FORBIDDEN
      )
    }

    return true
  }
}
