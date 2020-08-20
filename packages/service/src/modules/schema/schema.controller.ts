import {
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  Delete,
  Request,
  UseGuards,
  Controller,
  UseInterceptors,
  UnauthorizedException,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { IsNotEmpty } from 'class-validator'
import { CollectionV2 } from '@/constants'
import { PermissionGuard } from '@/guards'
import { checkAccessAndGetResource } from '@/utils'
import { CloudBaseService } from '@/dynamic_modules'
import { CmsException, RecordExistException, RecordNotExistException } from '@/common'
import { SchemaService } from './schema.service'
import { SchemaTransfromPipe } from './schema.pipe'
import { SchemaV2 } from './types'

class SchemaQuery {
  @IsNotEmpty()
  projectId: string

  page?: number

  pageSize?: number
}

@UseGuards(PermissionGuard('schema'))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('schema')
export class SchemaController {
  constructor(private schemaService: SchemaService, private cloudbaseService: CloudBaseService) {}

  @Get()
  async getSchemas(@Query() query: SchemaQuery, @Request() req: AuthRequest) {
    const { projectId, page = 1, pageSize = 100 } = query

    const schemas = checkAccessAndGetResource(projectId, req)

    const $ = this.cloudbaseService.db.command
    const filter: any = {}
    projectId && (filter.projectId = projectId)

    if (schemas !== '*') {
      filter._id = $.in(schemas)
    }

    const { data, requestId } = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where(filter)
      .skip(Number(page - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .get()

    return {
      data,
      requestId,
    }
  }

  @Get(':id')
  async getSchema(@Query() query: SchemaQuery, @Param('id') schemaId, @Request() req: AuthRequest) {
    const { projectId } = query

    checkAccessAndGetResource(projectId, req, schemaId)

    const {
      data: [schema],
      requestId,
    } = await this.cloudbaseService.collection(CollectionV2.Schemas).doc(schemaId).get()

    return {
      data: schema,
      requestId,
    }
  }

  @Post()
  async createSchema(@Body(new SchemaTransfromPipe('create')) body: SchemaV2) {
    // 检查同名集合是否存在，全局范围，不同项目不允许存在同名的集合
    const { data } = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where({
        collectionName: body.collectionName,
      })
      .get()

    if (data?.length) {
      throw new RecordExistException()
    }

    const code = await this.schemaService.createCollection(body.collectionName)

    if (code) {
      throw new CmsException(code, '创建集合失败')
    }

    const res = await this.cloudbaseService.collection(CollectionV2.Schemas).add(body)

    return res
  }

  @Put(':id')
  async updateSchema(
    @Param('id') schemaId,
    @Body(new SchemaTransfromPipe('update')) payload: SchemaV2,
    @Request() req: AuthRequest
  ) {
    checkAccessAndGetResource(payload.projectId, req, schemaId)

    const {
      data: [schema],
    } = await this.cloudbaseService.collection(CollectionV2.Schemas).doc(schemaId).get()

    if (!schema) {
      throw new RecordNotExistException('原型不存在！')
    }

    // 只有管理员可以重名集合
    if (payload.collectionName && !req.cmsUser.isAdmin) {
      throw new UnauthorizedException('您无权限进行重命名集合的操作')
    }

    const res = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where({
        _id: schemaId,
      })
      .update(payload)

    // 重命名集合
    if (payload?.collectionName !== schema.collectionName) {
      await this.schemaService.renameCollection(schema.collectionName, payload.collectionName)
    }

    return res
  }

  @Delete(':id')
  async deleteSchema(
    @Param('id') schemaId,
    @Body() body: { projectId: string; deleteCollection: boolean },
    @Request() req: AuthRequest
  ) {
    const { projectId, deleteCollection } = body

    checkAccessAndGetResource(projectId, req, schemaId)

    // 只有管理员可以删除集合
    if (deleteCollection && !req.cmsUser.isAdmin) {
      throw new UnauthorizedException('您无权限进行删除集合的操作')
    }

    const {
      data: [schema],
    } = await this.cloudbaseService.collection(CollectionV2.Schemas).doc(schemaId).get()

    const res = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where({
        _id: schemaId,
      })
      .remove()

    if (deleteCollection) {
      await this.schemaService.deleteCollection(schema.collectionName)
    }

    return res
  }
}
