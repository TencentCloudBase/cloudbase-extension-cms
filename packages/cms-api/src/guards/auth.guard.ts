import { UnauthorizedOperation, UnsupportedOperation } from '@/common'
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

    // 获取全部模型数据
    const schemas = await getCollectionSchema()
    const schema = schemas.find((_) => _.collectionName === collectionName)

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

    const [
      {
        data: [project],
      },
      {
        data: [setting],
      },
    ]: [{ data: Project[] }, { data: GlobalSetting[] }] = await Promise.all([
      // 查询项目
      db.collection(Collection.Projects).doc(schema.projectId).get(),
      db.collection(Collection.Settings).where({}).get(),
    ])

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
    if (!project.enableApiAccess && !setting?.enableApiAccess) {
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
    if (!project.apiAccessPath && !setting.apiAccessPath) {
      throw new HttpException(
        {
          error: { code: 'NOT_FOUND', message: 'API 访问路径未设置' },
        },
        HttpStatus.FORBIDDEN
      )
    }

    // 校验 API Token
    if (setting?.enableApiAuth) {
      const bearerToken = req.headers['authorization']

      if (!bearerToken) {
        throw new UnauthorizedOperation('非法访问')
      }

      if (!/^Bearer\s/.test(bearerToken)) {
        throw new UnauthorizedOperation('Token 格式不正确')
      }

      const token = bearerToken.replace('Bearer ', '')

      const accessToken = setting?.apiAuthTokens?.find((_) => _.token === token)
      if (!accessToken || !accessToken.permissions?.length) {
        throw new UnauthorizedOperation('非法访问：权限异常')
      }
      req.accessToken = accessToken
    }

    // 校验关联查询的关系
    const connectCollections = schema.fields
      .filter((field) => field.type === 'Connect')
      .map((_) => schemas.find((schema) => schema._id === _.connectResource)?.collectionName)

    // 关联集合不可读
    const hasUnreadableConnectData = connectCollections.some(
      (collection) => !project.readableCollections.includes(collection)
    )

    if (hasUnreadableConnectData) {
      throw new HttpException(
        {
          error: {
            code: 'NOT_ALLOWED',
            message: '此集合存在关联集合不可访问',
          },
        },
        HttpStatus.FORBIDDEN
      )
    }

    return true
  }
}
