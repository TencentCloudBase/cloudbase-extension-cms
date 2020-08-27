import _ from 'lodash'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules/cloudbase'
import { dateToNumber } from '@/utils'
import { CollectionV2 } from '@/constants'
import { SchemaV2, SchemaFieldV2 } from '../schemas/types'
import { CmsException, BadRequestException } from '@/common'

@Injectable()
export class ContentsService {
  constructor(private cloudbaseService: CloudBaseService) {}

  async getMany(
    resource: string,
    options: {
      filter?: {
        _id?: string
        ids?: string[]
        [key: string]: any
      }
      fuzzyFilter?: {
        [key: string]: any
      }
      pageSize?: number
      page?: number
      sort?: {
        [key: string]: 'ascend' | 'ascend'
      }
    }
  ) {
    const { filter = {}, fuzzyFilter, page = 1, pageSize = 20, sort } = options
    const db = this.cloudbaseService.db
    const collection = this.cloudbaseService.collection(resource)

    let where: any = {}

    // 支持批量查询
    if (filter?.ids?.length) {
      where._id = db.command.in(filter.ids)
    }

    const {
      data: [schema],
    }: { data: SchemaV2[] } = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where({
        collectionName: resource,
      })
      .get()

    // 模糊搜索
    if (fuzzyFilter && schema) {
      const conditions = this.handleFuzzySearch(fuzzyFilter, schema)
      where = {
        ...where,
        ...conditions,
      }
    }

    // 过滤
    if (filter && schema) {
      const conditions = this.handleFuzzySearch(filter, schema)
      where = {
        ...where,
        ...conditions,
      }
    }

    console.log('where', where)

    let query = collection.where(where)

    // 获取总数
    const countRes = await query.count()
    // 查询
    query = query.skip(Number(page - 1) * Number(pageSize)).limit(pageSize)

    if (sort) {
      Object.keys(sort)
        .filter((key) => sort[key])
        .forEach((key: string) => {
          const direction = sort[key] === 'ascend' ? 'asc' : 'desc'
          query = query.orderBy(key, direction)
        })
    }

    // 内置排序字段
    if (schema?.fields?.find((_) => _.isOrderField)) {
      const orderFields = schema?.fields?.filter((field) => field.isOrderField)
      orderFields.forEach((field) => {
        query = query.orderBy(field.name, field.orderDirection)
      })
    }

    const res = await query.get()

    // 如果获取定义的内容，且内容中存在关联的字段
    // 则把返回结果中的所有关联字段 id 转换为关联 id 对应的数据
    if (schema) {
      // 存在关联类型字段
      const connectFields = schema.fields.filter((field) => field.type === 'Connect')

      if (connectFields?.length) {
        res.data = await this.transformConnectField(res.data, connectFields)
      }
    }

    return { ...res, total: countRes.total }
  }

  async getOne(resource: string, options: { filter: { _id?: string } }) {
    const { filter = {} } = options
    const collection = this.cloudbaseService.collection(resource)

    let query = collection.where(filter)

    return query.limit(1).get() as any
  }

  async updateOne(
    resource: string,
    options: { filter: { _id: string }; payload: Record<string, any> }
  ) {
    const { filter, payload } = options
    const collection = this.cloudbaseService.collection(resource)

    if (!filter._id) {
      throw new BadRequestException('Id 不存在，更新失败！')
    }

    // 查询记录是否存在
    let {
      data: [record],
    } = await collection.where(filter).limit(1).get()

    if (!record) {
      return {}
    }

    const updateData = _.omit(payload, '_id')

    // 更新记录
    return collection.doc(record._id).update({
      ...updateData,
      _updateTime: dateToNumber(),
    })
  }

  async updateMany(
    resource: string,
    options: {
      filter: { ids?: string[] }
      payload: Record<string, any>
    }
  ) {
    const { filter = {}, payload } = options
    const db = this.cloudbaseService.db
    const collection = this.cloudbaseService.collection(resource)

    const data = _.omit(payload, '_id')

    return collection
      .where({
        _id: db.command.in(filter.ids),
      })
      .update({
        ...data,
        _updateTime: dateToNumber(),
      })
  }

  async createOne(
    resource: string,
    options: {
      payload?: Record<string, any>
    }
  ) {
    const { payload } = options
    const collection = this.cloudbaseService.collection(resource)

    const data = {
      ...payload,
      _createTime: dateToNumber(),
      _updateTime: dateToNumber(),
    }

    return collection.add(data)
  }

  async deleteOne(resource: string, options: { filter: { _id?: string } }) {
    const { filter = {} } = options
    const collection = this.cloudbaseService.collection(resource)

    const { data } = await collection
      .where({
        _id: filter._id,
      })
      .limit(1)
      .get()

    if (!data?.length) {
      return {
        deleted: 0,
      }
    }

    return collection.doc(data[0]?._id).remove()
  }

  async deleteMany(resource: string, options: { filter: { ids?: string[] } }) {
    const { filter = {} } = options
    const db = this.cloudbaseService.db
    const collection = this.cloudbaseService.collection(resource)

    return collection
      .where({
        _id: db.command.in(filter.ids),
      })
      .remove()
  }

  private handleFuzzySearch(fuzzyFilter: Record<string, any>, schema: SchemaV2) {
    const { db } = this.cloudbaseService
    const $ = db.command
    const where = {}

    Object.keys(fuzzyFilter)
      .filter((key) => typeof fuzzyFilter[key] !== 'undefined' && fuzzyFilter[key] !== null)
      .forEach((key) => {
        console.log(key)
        const value = fuzzyFilter[key]

        if (typeof value === 'boolean' || typeof value === 'number' || key === '_id') {
          where[key] = value
          return
        }

        const field = schema.fields.find((_) => _.name === key)

        if (field.type === 'Connect') {
          where[key] = field.connectMany ? $.in(fuzzyFilter[key]) : fuzzyFilter[key]
          return
        }

        if (field.type === 'Array' || field.type === 'Enum') {
          where[key] = Array.isArray(fuzzyFilter[key])
            ? $.in(fuzzyFilter[key])
            : $.in([fuzzyFilter[key]])
          return
        }

        where[key] = db.RegExp({
          options: 'ig',
          regexp: String(fuzzyFilter[key]),
        })
      })

    return where
  }

  // 处理数据返回结果
  private async transformConnectField(rawData: any[], connectFields: SchemaFieldV2[]) {
    let data = rawData
    const $ = this.cloudbaseService.db.command

    // 获取所有 Schema 数据
    const { data: schemas } = await this.cloudbaseService
      .collection(CollectionV2.Schemas)
      .where({})
      .limit(1000)
      .get()

    // 转换 data 中的关联 field
    const transformDataByField = async (field: SchemaFieldV2) => {
      const { connectMany } = field
      // 关联字段名
      const fieldName = field.name

      // 获取数据中所有的关联资源 Id
      let ids = []
      if (connectMany) {
        // 合并数组
        ids = data
          .filter((record) => record[fieldName]?.length)
          .map((record) => record[fieldName])
          .reduce((ret, current) => [...ret, ...current], [])
      } else {
        ids = data.map((record) => record[fieldName]).filter((_) => _)
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

      data = data.map((record) => {
        if (!record[fieldName]) return record
        let connectRecord

        if (connectMany) {
          connectRecord = record[fieldName].map((id) => connectData.find((_) => _._id === id))
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

    return data
  }
}
