import _ from 'lodash'
import {
  Get,
  Post,
  Body,
  Patch,
  Query,
  Param,
  Delete,
  Request,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
  ClassSerializerInterceptor,
  Controller,
} from '@nestjs/common'
import { Collection } from '@/constants'
import { PermissionGuard } from '@/guards'
import { checkAccessAndGetResource, clearSchemaCache, getCollectionSchema } from '@/utils'
import { CloudBaseService } from '@/services'
import { CmsException, RecordExistException, RecordNotExistException } from '@/common'
import { SchemasService } from './schema.service'
import { SchemaTransfromPipe } from './schema.pipe'
import { Schema } from './types'

class SchemaQuery {
  page?: number

  pageSize?: number
}

@UseGuards(PermissionGuard('schema'))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/schemas')
export class SchemasController {
  constructor(public schemaService: SchemasService, public cloudbaseService: CloudBaseService) {}

  @Get()
  async getSchemas(
    @Param('projectId') projectId,
    @Query() query: SchemaQuery,
    @Request() req: IRequest
  ) {
    const { page = 1, pageSize = 100 } = query

    const schemas = checkAccessAndGetResource({
      req,
      projectId,
      action: 'get',
    })

    const $ = this.cloudbaseService.db.command
    let filter: any = {}
    let _id

    if (schemas !== '*') {
      _id = $.in(schemas)
    }

    if (projectId) {
      filter = $.or(
        { _id, projectId },
        {
          _id,
          projectIds: $.elemMatch($.eq(projectId)),
        }
      )
    }

    const { data, requestId } = await this.cloudbaseService
      .collection(Collection.Schemas)
      .where(filter)
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data,
      requestId,
    }
  }

  @Get(':schemaId')
  async getSchema(@Param() params, @Request() req: IRequest) {
    const { projectId, schemaId } = params

    checkAccessAndGetResource({
      req,
      projectId,
      action: 'get',
      resourceId: schemaId,
    })

    const {
      data: [schema],
      requestId,
    } = await this.cloudbaseService.collection(Collection.Schemas).doc(schemaId).get()

    return {
      data: schema,
      requestId,
    }
  }

  @Post()
  async createSchema(
    @Param('projectId') projectId,
    @Body(new SchemaTransfromPipe('create')) body: Schema
  ) {
    // 检查同名集合是否存在，全局范围，不同项目不允许存在同名的集合
    const schema = await getCollectionSchema(body.collectionName)

    if (schema) {
      throw new RecordExistException(`系统中已存在绑定了此数据库 ${schema?.collectionName} 的模型`)
    }

    // 创建集合
    const code = await this.schemaService.createCollection(body.collectionName)

    if (code) {
      throw new CmsException(code, '创建集合失败')
    }

    return this.cloudbaseService.collection(Collection.Schemas).add({
      ...body,
      projectId,
    })
  }

  @Patch(':schemaId')
  async updateSchema(
    @Param() params,
    @Body(new SchemaTransfromPipe('update')) payload: Schema,
    @Request() req: IRequest
  ) {
    const { projectId, schemaId } = params

    checkAccessAndGetResource({
      req,
      projectId,
      action: 'update',
      resourceId: schemaId,
    })

    const {
      data: [schema],
    } = await this.cloudbaseService.collection(Collection.Schemas).doc(schemaId).get()

    if (!schema) {
      throw new RecordNotExistException('模型不存在！')
    }

    // 只有管理员可以重名集合
    if (payload.collectionName && !req.cmsUser.isAdmin) {
      throw new UnauthorizedException('您无权限进行重命名集合的操作')
    }

    const data = _.omit(payload, 'projectId')

    const res = await this.cloudbaseService
      .collection(Collection.Schemas)
      .where({
        _id: schemaId,
      })
      .update(data)

    // 重命名集合
    if (payload?.collectionName !== schema.collectionName) {
      await this.schemaService.renameCollection(schema.collectionName, payload.collectionName)
    }

    // 使原有的 schema 缓存失效
    clearSchemaCache(schema.collectionName)

    return res
  }

  @Delete(':schemaId')
  async deleteSchema(
    @Param() params,
    @Body() body: { deleteCollection: boolean },
    @Request() req: IRequest
  ) {
    const { projectId, schemaId } = params
    const { deleteCollection } = body

    checkAccessAndGetResource({
      req,
      projectId,
      action: 'delete',
      resourceId: schemaId,
    })

    // 只有管理员可以删除集合
    if (deleteCollection && !req.cmsUser.isAdmin) {
      throw new UnauthorizedException('您无权限进行删除集合的操作')
    }

    const {
      data: [schema],
    } = await this.cloudbaseService.collection(Collection.Schemas).doc(schemaId).get()

    const res = await this.cloudbaseService
      .collection(Collection.Schemas)
      .where({
        _id: schemaId,
      })
      .remove()

    if (deleteCollection) {
      await this.schemaService.deleteCollection(schema.collectionName)
    }

    // 使原有的 schema 缓存失效
    clearSchemaCache(schema.collectionName)

    return res
  }
}
