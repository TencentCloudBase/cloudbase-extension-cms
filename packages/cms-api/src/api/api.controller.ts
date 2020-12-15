import _ from 'lodash'
import {
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Patch,
  Put,
  UseGuards,
  Controller,
} from '@nestjs/common'
import { IsJSON, IsNumber, IsOptional } from 'class-validator'
import { ActionGuard, RequestAuthGuard } from '@/guards'
import { formatPayloadDate } from '@/utils'
import { CloudBaseService, LocalCacheService } from '@/services'

import { ApiService } from './api.service'

class IQuery {
  @IsOptional()
  @IsNumber()
  limit?: number

  @IsOptional()
  @IsNumber()
  skip?: number

  @IsOptional()
  @IsJSON()
  fields?: string

  @IsOptional()
  @IsJSON()
  sort?: string
}

class IPayload {
  @IsOptional()
  data?: Object | Object[]

  @IsOptional()
  query?: Object
}

/**
 * 查询 doc 处理说明
 * 1. hiddenInApi 的字段要在返回值中隐藏
 * 2. 批量查询时，order 字段要处理
 * 3. 返回值中的关联字段要转换成对应的数据
 * 4. 返回值中的 cloudId 转换成 https 链接，注意数组
 * 5. 请求中的时间字符串要做转换
 */

@Controller('/v1.0')
@UseGuards(RequestAuthGuard)
export class ApiController {
  constructor(
    private readonly cloudbaseService: CloudBaseService,
    private readonly apiService: ApiService,
    private readonly cacheService: LocalCacheService
  ) {}

  // 获取单个文档
  @UseGuards(ActionGuard('read'))
  @Get(':collectionName/:docId')
  async getDocument(@Param() params: { collectionName: string; docId: string }) {
    const { collectionName, docId } = params

    // 获取数据模型
    const docSchema = this.cacheService.get('currentSchema')

    // 查询数据库
    let dbQuery = this.collection(collectionName).doc(docId)

    // 内置过滤字段，拼接查询条件
    const hiddenFields = docSchema?.fields?.filter((field) => field.isHiddenInApi)
    if (hiddenFields?.length) {
      const fieldsObject = hiddenFields.reduce((prev, current) => {
        prev[current.name] = false
        return prev
      }, {})
      dbQuery = dbQuery.field(fieldsObject)
    }

    // 查询数据
    const { data, requestId } = await dbQuery.get()

    // 处理返回值
    const [doc] = await this.apiService.parseResData(data, collectionName)

    return {
      requestId,
      // doc 不存在时，返回 null
      data: doc || null,
    }
  }

  // 简单查询
  @UseGuards(ActionGuard('read'))
  @Get(':collectionName')
  async getDocuments(@Param('collectionName') collectionName: string, @Query() query: IQuery) {
    const apiQuery = await this.apiService.getMergedQuery(query)

    // 查询数据
    let findRes = await this.apiService.callOpenApi({
      collectionName,
      action: 'find',
      query: apiQuery,
    })

    // 查询 total 的值
    const { total } = await this.apiService.callOpenApi({
      collectionName,
      action: 'count',
      query: apiQuery,
    })

    findRes.data = await this.apiService.parseResData(findRes.data, collectionName)

    return { total, ...findRes }
  }

  /**
   * 支持 command 操作符的复杂操作
   */
  @UseGuards(ActionGuard('read'))
  @Post(':collectionName/find')
  async findDocuments(
    @Param('collectionName') collectionName: string,
    @Query() query,
    @Body() payload
  ) {
    const apiQuery = await this.apiService.getMergedQuery(query)

    const { total } = await this.apiService.callOpenApi({
      collectionName,
      action: 'count',
      data: payload,
      query: apiQuery,
    })

    const res = await this.apiService.callOpenApi({
      collectionName,
      action: 'find',
      data: payload,
      query: apiQuery,
    })

    res.data = await this.apiService.parseResData(res.data, collectionName)

    return {
      ...res,
      total: total,
    }
  }

  // 创建文档
  @UseGuards(ActionGuard('modify'))
  @Post(':collectionName')
  async createDocument(@Param('collectionName') collectionName: string, @Body() payload) {
    const formatDoc = await formatPayloadDate(payload.data, collectionName)
    return this.collection(collectionName).add(formatDoc)
  }

  // 更新单个文档
  @UseGuards(ActionGuard('modify'))
  @Patch(':collectionName/:docId')
  async updateDocument(
    @Param() params: { collectionName: string; docId: string },
    @Body() payload: IPayload
  ) {
    const { docId, collectionName } = params
    const formatDoc = await formatPayloadDate(payload.data, collectionName)
    return this.collection(collectionName).doc(docId).update(formatDoc)
  }

  // 批量更新文档
  @UseGuards(ActionGuard('modify'))
  @Patch(':collectionName')
  async patchUpdateDocuments(
    @Param('collectionName') collectionName: string,
    @Body() payload: IPayload
  ) {
    return this.apiService.callOpenApi({
      collectionName,
      action: 'updateMany',
      data: payload,
    })
  }

  // 替换文档
  @UseGuards(ActionGuard('modify'))
  @Put(':collectionName/:docId')
  async setDocument(
    @Param() params: { collectionName: string; docId: string },
    @Body() payload: IPayload
  ) {
    const { collectionName, docId } = params
    return this.collection(collectionName).doc(docId).set(payload.data)
  }

  // 删除指定文档
  @UseGuards(ActionGuard('delete'))
  @Delete(':collectionName/:docId')
  async deleteDocument(@Param() params: { collectionName: string; docId: string }) {
    const { collectionName, docId } = params
    return this.collection(collectionName).doc(docId).remove()
  }

  // 批量删除文档
  @UseGuards(ActionGuard('delete'))
  @Delete(':collectionName')
  async batchDeleteDocument(
    @Param('collectionName') collectionName: string,
    @Body() payload: IPayload
  ) {
    return this.apiService.callOpenApi({
      collectionName,
      action: 'deleteMany',
      data: payload,
    })
  }

  private collection(name: string) {
    return this.cloudbaseService.collection(name)
  }
}
