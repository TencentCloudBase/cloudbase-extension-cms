import _ from 'lodash'
import R from 'ramda'
import { Collection } from '@/constants'
import { Injectable } from '@nestjs/common'
import { CloudBaseService, LocalCacheService, SchemaCacheService } from '@/services'
import { isNotEmpty, formatPayloadDate, getCollectionSchema, formatTimeByType } from '@/utils'
import { BadRequestException, RecordNotExistException, getSchemaSystemFields } from '@/common'

/**
 * CMS 系统使用的集合，不存在 schema 定义
 */
const IGNORE_SCHEMA_COLLECTIONS = [Collection.WebhookLog, Collection.Webhooks]

@Injectable()
export class ContentsService {
  constructor(
    private cloudbaseService: CloudBaseService,
    private readonly cacheService: LocalCacheService,
    private readonly schemaCacheService: SchemaCacheService
  ) {}

  /**
   * 查询
   */
  async getMany(
    resource: string,
    options: {
      // 过滤
      filter?: {
        _id?: string
        ids?: string[]
        [key: string]: any
      }
      // 模糊查询
      fuzzyFilter?: {
        [key: string]: any
      }
      // 分页
      pageSize?: number
      page?: number
      // 排序
      sort?: {
        [key: string]: 'ascend' | 'ascend'
      }
    }
  ) {
    const { filter = {}, fuzzyFilter, page = 1, pageSize = 10, sort } = options
    const { db } = this.cloudbaseService
    const collection = this.collection(resource)

    let where: any = {}

    // 支持批量查询
    if (filter?.ids?.length) {
      where._id = db.command.in(filter.ids)
    }

    // 获取所有 Schema 数据
    const schemas = await this.schemaCacheService.getCollectionSchema()
    // 当前 Schema 配置
    const schema = schemas.find((_) => _.collectionName === resource)

    // 模糊搜索
    if (fuzzyFilter && schema) {
      const conditions = this.handleFuzzySearch(fuzzyFilter, schema)
      where = {
        ...where,
        ...conditions,
      }
    }

    if (filter && schema) {
      const conditions = this.handleFuzzySearch(filter, schema)
      where = {
        ...where,
        ...conditions,
      }
    } else if (!_.isEmpty(filter)) {
      // 过滤，精确匹配，适用  webhooks 搜索
      Object.keys(filter)
        .filter((key) => typeof filter[key] !== 'undefined' && filter[key] !== null)
        .forEach((key) => {
          where[key] = filter[key]
        })
    }

    console.info('where 查询', where)

    let query = collection.where(where)

    // 获取符合查询条件的文档总数
    const countRes = await query.count()

    // 分页查询
    query = query.skip(Number(page - 1) * Number(pageSize)).limit(pageSize)

    // 排序
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

    // 数据库查询
    const res = await query.get()

    // 如果获取定义的内容，且内容中存在关联的字段
    // 则把返回结果中的所有关联字段 id 转换为对应的 Doc
    if (schema) {
      // 存在关联类型字段
      const connectFields = schema.fields.filter((field) => field.type === 'Connect')
      if (!R.isEmpty(connectFields)) {
        // 存储 connect schema，以确认是否发生循环关联
        const connectTraverseCollections = this.cacheService.get('connectTraverseCollections') || []
        this.cacheService.set(
          'connectTraverseCollections',
          connectTraverseCollections.concat([schema.collectionName])
        )
        // 获取 connect 数据
        res.data = await this.transformConnectField(res.data, connectFields)
      }
    }

    return { ...res, total: countRes.total }
  }

  /**
   * 更新 doc 内容
   */
  async updateOne(
    resource: string,
    options: { filter: { _id: string }; payload: Record<string, any> }
  ) {
    const { filter } = options
    const doc = await this.formatUpdatedDoc(resource, options)

    // 更新记录
    return this.collection(resource).doc(filter._id).update(doc)
  }

  /**
   * 替换更新一条 doc
   */
  async setOne(
    resource: string,
    options: { filter: { _id: string }; payload: Record<string, any> }
  ) {
    const { filter } = options
    const doc = await this.formatUpdatedDoc(resource, options)

    // 替换记录
    return this.collection(resource).doc(filter._id).set(doc)
  }

  /**
   * 创建一个 doc
   */
  async createOne(
    resource: string,
    options: {
      payload?: Record<string, any>
    }
  ) {
    let { payload } = options
    const collection = this.collection(resource)

    const schema = await getCollectionSchema(resource)
    payload = await formatPayloadDate(payload, resource)

    this.appendSystemField(payload, schema, '_createTime', '_updateTime')

    return collection.add(payload)
  }

  /**
   * 删除一个记录
   */
  async deleteOne(resource: string, options: { filter: { _id?: string } }) {
    const { filter = {} } = options
    return this.collection(resource).doc(filter._id).remove()
  }

  /**
   * 删除多个记录
   */
  async deleteMany(resource: string, options: { filter: { ids?: string[] } }) {
    const { filter = {} } = options
    const db = this.cloudbaseService.db
    const collection = this.collection(resource)

    return collection
      .where({
        _id: db.command.in(filter.ids),
      })
      .remove()
  }

  // 简写
  private collection(collection: string) {
    return this.cloudbaseService.collection(collection)
  }

  /**
   * 处理字段搜索
   */
  private handleFuzzySearch(fuzzyFilter: Record<string, any>, schema: Schema) {
    const { db } = this.cloudbaseService
    const $ = db.command
    const where = {}

    Object.keys(fuzzyFilter)
      .filter((key) => typeof fuzzyFilter[key] !== 'undefined' && fuzzyFilter[key] !== null)
      .forEach((key) => {
        const value = fuzzyFilter[key]

        if (typeof value === 'boolean' || typeof value === 'number' || key === '_id') {
          where[key] = value
          return
        }

        const field = schema.fields.find((_) => _.name === key)

        if (!field) return

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

        // fuzzyFilter[key] 可能为空
        where[key] = fuzzyFilter[key]
          ? db.RegExp({
              options: 'ig',
              regexp: String(fuzzyFilter[key]),
            })
          : fuzzyFilter[key]
      })

    return where
  }

  /**
   * 处理数据返回结果
   * 将数据中的关联字段转换成原始 Doc 后返回
   */
  private async transformConnectField(docs: any[], connectFields: SchemaField[]) {
    let resData: any[] = docs
    const $ = this.cloudbaseService.db.command

    // 获取所有 Schema 数据
    const schemas = await this.schemaCacheService.getCollectionSchema()

    // 转换 data 中的关联 field
    const transformDataByField = async (field: SchemaField) => {
      const { connectMany } = field
      // 字段类型为关联的字段名
      const fieldName = field.name

      // 获取数据中所有的关联资源 Id
      let ids = []
      // 关联多个对象，将 Doc 数组中的 id 数组合并、去重
      if (connectMany) {
        ids = R.pipe(
          R.reject<any>(R.where({ [fieldName]: R.isEmpty })),
          R.map(R.prop(fieldName)),
          R.reduce(R.union, []),
          R.filter(isNotEmpty)
        )(resData)
      } else {
        // 关联单个对象，取 Doc 数组中的 id，过滤
        ids = R.pipe(R.map(R.prop(fieldName)), R.filter(isNotEmpty))(resData)
      }

      // 关联的 Schema
      const collectionName = schemas.find((schema) => schema._id === field.connectResource)
        ?.collectionName

      // schema 不存在
      if (!collectionName) {
        throw new RecordNotExistException(`关联模型 ${field.connectResource} 不存在`)
      }

      // 获取关联 id 对应的 Doc
      // 使用 getMany 获取数据，自动转换 Connect 字段
      let connectData = []
      // 是否发生循环关联
      const existCircle = this.cacheService
        .get('connectTraverseCollections')
        .includes(collectionName)

      // 存在环且会在当前的节点发生循环，直接获取底层数据
      if (existCircle) {
        const { data } = await this.cloudbaseService
          .collection(collectionName)
          .where({ _id: $.in(ids) })
          .limit(1000)
          .get()
        connectData = data
      } else {
        // 不发生循环，获取关联转换的数据
        const { data } = await this.getMany(collectionName, {
          page: 1,
          pageSize: 1000,
          filter: {
            ids,
          },
        })
        connectData = data
      }

      // 修改 resData 中的关联字段
      resData = resData.map((record) => {
        // 关联字段的值：id 或 [id]
        const connectValue = record[fieldName]
        if (!connectValue) return record

        // 关联的数据被删除
        if (!connectData) {
          record[fieldName] = null
          return record
        }

        let connectRecord

        // id 数组
        if (connectMany) {
          connectRecord = connectValue?.length
            ? connectValue?.map((id) => connectData.find((_) => _._id === id))
            : []
        } else {
          connectRecord = connectData.find((_) => _._id === connectValue)
        }

        record[fieldName] = connectRecord
        return record
      })
    }

    // 转换 connectField
    const tasks = connectFields.map(transformDataByField)
    await Promise.all(tasks)

    return resData
  }

  /**
   * 格式化需要更新的 doc
   */
  private async formatUpdatedDoc(
    resource: string,
    options: { filter: { _id: string }; payload: Record<string, any> }
  ) {
    const { filter, payload } = options

    if (!filter?._id) {
      throw new BadRequestException('Id 不存在，更新失败！')
    }

    // 不能更新 _id
    let doc = _.omit(payload, '_id')

    if (!IGNORE_SCHEMA_COLLECTIONS.includes(resource)) {
      // 查询 schema 信息
      const schema = await this.schemaCacheService.getCollectionSchema(resource)

      if (!schema) {
        throw new RecordNotExistException('模型记录不存在')
      }

      // 格式化 payload 中的时间
      doc = await formatPayloadDate(doc, resource, schema)

      // 处理 doc 中的特殊值
      doc = _.mapValues(doc, (value, key) => {
        // 查询 field 属性
        const field = schema.fields.find((item) => item.name === key)

        // 当更新 Connect 类型数据时，如果请求的数据对象，则提取 id 存储
        if (field?.type === 'Connect' && value) {
          // 多关联
          if (Array.isArray(value) && _.isObject(value?.[0])) {
            return value.map((_) => (_?._id ? _._id : _))
          }

          // 单关联
          if (!Array.isArray(value) && _.isObject(value)) {
            return (value as any)._id
          }

          // value 为 null
          return value
        }

        // 对象需要更新整个值
        if (field?.type === 'Object') {
          return this.cloudbaseService.db.command.set(value)
        }

        return value
      })

      // 设置更新时间
      this.appendSystemField(doc, schema, '_updateTime')
    } else {
      this.appendSystemField(doc, null, '_updateTime')
    }

    return doc
  }

  /**
   * 添加系统字段
   */
  private appendSystemField(
    doc: Record<string, any>,
    schema: Schema,
    ...fieldName: SystemControlFields[]
  ) {
    const docContext = getDocProcessContext(schema)

    fieldName.forEach((name) => {
      doc[docContext[name].name] = docContext[name].resolver()
    })

    return doc
  }
}

/**
 * doc 处理 ctx 记录
 */
function getDocProcessContext(schema: Schema) {
  const now = Date.now()

  // schema not exist, such as webhook
  if (!schema) {
    return {
      _createTime: {
        name: '_createTime',
        resolver: () => now,
      },
      _updateTime: {
        name: '_updateTime',
        resolver: () => now,
      },
    }
  }

  const systemFields: SchemaField[] = getSchemaSystemFields(schema)

  const createTimeField = systemFields.find(
    (_) => _.name === '_createTime' || _.name === schema.docCreateTimeField
  )
  const updateTimeField = systemFields.find(
    (_) => _.name === '_updateTime' || _.name === schema.docUpdateTimeField
  )

  const createTime = formatTimeByType(createTimeField.dateFormatType, now)
  const updateTime = formatTimeByType(updateTimeField.dateFormatType, now)

  return {
    _createTime: {
      name: createTimeField.name,
      resolver: () => createTime,
    },
    _updateTime: {
      name: updateTimeField.name,
      resolver: () => updateTime,
    },
  }
}
