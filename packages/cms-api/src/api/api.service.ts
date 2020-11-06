import Axios from 'axios'
import querystring from 'querystring'
import { sign } from '@cloudbase/signature-nodejs'
import { Collection } from '@/constants'
import { CloudBaseService } from '@/services'
import { Injectable } from '@nestjs/common'
import { getCredential, getEnvIdString } from '@/utils'
import { RecordExistException } from '@/common'

interface IQuery extends NodeJS.Dict<number | string> {
  limit?: number
  skip?: number
  fields?: string
  sort?: string
}

type OpenApiAction = 'find' | 'count' | 'updateOne' | 'updateMany' | 'deleteOne' | 'deleteMany'

@Injectable()
export class ApiService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  /**
   * 合并传入的 query 与 Schema 内置的条件，获取最终查询 query
   */
  async getMergedQuery(collectionName: string, query: IQuery) {
    // 调用 api 传入的 query
    let { limit, skip, fields = '', sort = '' } = query
    sort = JSON.parse(sort) || {}
    fields = JSON.parse(fields) || {}

    // 获取 doc 原型信息
    const {
      data: [docSchema],
    }: { data: Schema[] } = await this.cloudbaseService
      .collection(Collection.Schemas)
      .where({
        collectionName,
      })
      .get()

    if (!docSchema) {
      throw new RecordExistException('内容原型不存在，查询错误！')
    }

    // Schema 中的默认排序字段
    const orderFields = docSchema?.fields?.filter((field) => field.isOrderField)
    if (orderFields?.length) {
      // 添加排序字段
      orderFields.forEach((field) => {
        // 传入参数优先于默认值
        if (sort[field.name]) {
          return
        } else {
          sort[field.name] = field.orderDirection === 'asc' ? 1 : -1
        }
      })
    }

    // Schema 中的过滤字段
    const hiddenFields = docSchema?.fields?.filter((field) => field.isHiddenInApi)
    if (hiddenFields?.length) {
      hiddenFields.forEach((field) => {
        if (fields[field.name]) {
          return
        } else {
          fields[field.name] = 0
        }
      })
    }

    return {
      skip,
      limit,
      sort: JSON.stringify(sort),
      fields: JSON.stringify(fields),
    }
  }

  /**
   * 对数据库查询的数据进行处理
   */
  async transformResData(resData: any[], collectionName: string) {
    if (!resData?.length) {
      return []
    }

    let formatData = resData

    // 获取数据原型
    const {
      data: [docSchema],
    }: { data: Schema[] } = await this.cloudbaseService
      .collection(Collection.Schemas)
      .where({
        collectionName,
      })
      .get()

    // 如果文档模型定义中存在关联字段
    // 则把返回结果中的所有关联字段 id 转换为对应的数据
    const connectFields = docSchema.fields.filter((field) => field.type === 'Connect')
    if (connectFields?.length) {
      formatData = await this.transformConnectField(resData, connectFields)
    }

    return formatData
  }

  /**
   * 处理数据返回结果
   * 将数据中的关联字段解析后返回
   */
  async transformConnectField(rawData: any[], connectFields: SchemaField[]) {
    let resData = rawData
    const $ = this.cloudbaseService.db.command

    // 获取所有 Schema 数据
    const { data: schemas } = await this.cloudbaseService
      .collection(Collection.Schemas)
      .where({})
      .limit(1000)
      .get()

    // 转换 data 中的关联 field
    const transformDataByField = async (field: SchemaField) => {
      const { connectMany } = field
      // 字段类型为关联的字段名
      const fieldName = field.name

      // 获取数据中所有的关联资源 Id
      let ids = []
      if (connectMany) {
        // 合并 id 记录
        ids = resData
          .filter((record) => record[fieldName]?.length)
          .map((record) => record[fieldName])
          .reduce((ret, current) => [...ret, ...current], [])
      } else {
        ids = resData.map((record) => record[fieldName]).filter((_) => _)
      }

      // 集合名
      const collectionName = schemas.find((schema) => schema._id === field.connectResource)
        .collectionName

      // 获取关联的数据，分页最大条数 50
      const { data: connectData } = await this.cloudbaseService
        .collection(collectionName)
        .where({ _id: $.in(ids) })
        .limit(1000)
        .get()

      // 修改 resData 中的关联字段
      resData = resData.map((record) => {
        if (!record[fieldName]) return record
        let connectRecord

        // 关联的数据被删除
        if (!connectData) {
          return {
            ...record,
            [fieldName]: null,
          }
        }

        if (connectMany) {
          // id 数组
          connectRecord = record[fieldName]?.length
            ? record[fieldName]?.map((id) => connectData.find((_) => _._id === id))
            : []
        } else {
          connectRecord = connectData.find((_) => _._id === record[fieldName])
        }

        return {
          ...record,
          [fieldName]: connectRecord,
        }
      })
    }

    // 转换 connectField
    const promises = connectFields.map(transformDataByField)

    await Promise.all(promises)

    return resData
  }

  /**
   * 复杂的查询，无法转换成 SDK 的调用
   * 直接调用数据库 Open API
   */
  async callOpenApi(options: {
    collectionName: string
    action: OpenApiAction
    query?: IQuery
    data?: any
  }) {
    const { collectionName, action, query = {}, data } = options
    // query 不参与签名
    const { authorization, sessionToken, timestamp } = this.getOpenApiSignature()
    const envId = getEnvIdString()

    // 将 query 转换成字符串
    const qs = querystring.stringify(query)
    const url = `https://tcb-api.tencentcloudapi.com/api/v2/envs/${envId}/databases/${collectionName}/documents:${action}?${qs}`

    // 请求
    const { data: res } = await Axios({
      method: 'POST',
      url: url,
      headers: {
        'X-CloudBase-Authorization': authorization,
        'X-CloudBase-SessionToken': sessionToken,
        'X-CloudBase-TimeStamp': timestamp,
      },
      data,
    })

    return res
  }

  /**
   * 计算 Open API 请求签名
   */
  private getOpenApiSignature(): {
    authorization: string
    sessionToken: string
    timestamp: number
  } {
    // 固定 URL
    const url = 'https://api.tcloudbase.com/'
    const headers = {
      host: 'api.tcloudbase.com',
      'content-type': 'application/json; charset=utf-8',
    }

    const timestamp = Math.floor(new Date().getTime() / 1000)
    const { secretId, secretKey, token } = getCredential()

    const { authorization } = sign({
      url,
      secretId,
      secretKey,
      method: 'POST',
      headers,
      timestamp,
      params: {},
    })

    const version = '1.0'
    const result = {
      authorization: version + ' ' + authorization,
      sessionToken: token,
      timestamp,
    }

    return result
  }
}
