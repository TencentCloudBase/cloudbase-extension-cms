import { Collection } from '@/constants'
import { getCloudBaseApp } from '@/utils'
import {
  CanActivate,
  HttpStatus,
  Injectable,
  HttpException,
  ExecutionContext,
} from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest & Request>()

    // 数据库集合名
    const collectionName = request.params?.collectionName
    const app = getCloudBaseApp()
    const db = app.database()
    const {
      data: [collection],
    } = await db
      .collection(Collection.Schemas)
      .where({
        collectionName,
      })
      .get()

    // 集合非 CMS 管理的集合，禁止访问
    if (!collection) {
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
    }: { data: Project[] } = await db
      .collection(Collection.Projects)
      .doc(collection.projectId)
      .get()

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
