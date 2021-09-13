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
  ) { }

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
   * @deprecated
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
        // console.error(`schema.fields数据：`, schema.fields)

        if (!field) return

        if (field.type === 'Connect') {
          where[key] = field.connectMany ? $.in(fuzzyFilter[key]) : fuzzyFilter[key]
          return
        }

        // 按事件段查询数据
        if ((field.type === "DateTime" || field.type === "Date") && Array.isArray(fuzzyFilter[key]) && (fuzzyFilter[key] as any[]).length === 2) {
          const formatType = field.dateFormatType
          const [min, max] = fuzzyFilter[key]
          let rangeRegStr = "";
          // console.error(`[min, max数据：`, min, max, where[key]);
          switch (formatType) {
            case "timestamp-ms":
            case "timestamp-s":
              where[key] = $.and($.gte(min), $.lte(max))
              break
            case "date":
              where[key] = $.and($.gte(new Date(min)), $.lte(new Date(max)))
              break
            case "string":
              rangeRegStr = this.getRangeTimeReg(field, min, max) || undefined;
              where[key] = rangeRegStr && db.RegExp({ options: 'ig', regexp: rangeRegStr });
              break
            default:
              break
          }
          if (where[key]) {
            return
          }
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
   * 根据传入的字符串时间，返回一个查询正则（方便查询数据库中以字符串形式储存的时间数据，返回空表示没有符合的正则表达式）
   * ps. 写这个接口时，未找到mongodb种能直接比较时间格式字符串的接口，我们只能退而求其次，用复杂的正则来实现这个功能
   */
  private getRangeTimeReg(field: SchemaField, min: string, max: string) {
    if ((field.type !== "DateTime" && field.type !== "Date") || field.dateFormatType !== "string" || !min || !max) {
      return null;
    }

    // 格式数组
    let formatLenArrs = [4, 2, 2]; // 格式化后每一项的字符长度（比如日期的格式为“YYYY-MM-DD”，长度分别为4，2，2）
    let connectSigns = ["-", "-"]; // 每一项之间的链接符（比如日期的格式为“YYYY-MM-DD”，链接符为“-”）

    // 解析日期
    const dateReg = /^\d{4}-\d{2}-\d{2}/;
    const minDate = min.match(dateReg)?.[0];
    const maxDate = max.match(dateReg)?.[0];
    if (minDate === undefined || maxDate === undefined) {
      return null;
    }
    const [minYear, minMonth, minDay] = minDate.split("-").map(item => parseInt(item, 10));
    const [maxYear, maxMonth, maxDay] = maxDate.split("-").map(item => parseInt(item, 10));

    let timeList: number[][][] = [];
    timeList = this.addTimeNum(timeList, { minNum: minYear, maxNum: maxYear }, { effMin: 0, effMax: 9999 });
    timeList = this.addTimeNum(timeList, { minNum: minMonth, maxNum: maxMonth }, { effMin: 1, effMax: 12 });
    timeList = this.addTimeNum(timeList, { minNum: minDay, maxNum: maxDay }, { effMin: 1, effMax: 31 });
    // console.error("解析出来的日期：", timeList);

    // 解析时间
    const timeReg = /\d{2}:\d{2}:\d{2}$/;
    const minTime = min.match(timeReg)?.[0];
    const maxTime = max.match(timeReg)?.[0];
    if (minTime !== undefined && maxTime !== undefined) {
      formatLenArrs = [...formatLenArrs, 2, 2, 2];
      connectSigns = [...connectSigns, " ", ":", ":"];

      const [minHour, minMinute, minSecond] = minTime.split(":").map(item => parseInt(item, 10));
      const [maxHour, maxMinute, maxSecond] = maxTime.split(":").map(item => parseInt(item, 10));
      timeList = this.addTimeNum(timeList, { minNum: minHour, maxNum: maxHour }, { effMin: 0, effMax: 23 });
      timeList = this.addTimeNum(timeList, { minNum: minMinute, maxNum: maxMinute }, { effMin: 0, effMax: 59 });
      timeList = this.addTimeNum(timeList, { minNum: minSecond, maxNum: maxSecond }, { effMin: 0, effMax: 59 });
      // console.error("解析出来的时间：", timeList);
    }

    // 生成正则数组
    const regExpArr = timeList.map(singleTimeNums => {
      let singleStrs = singleTimeNums.map((nums, numI) => {
        const formatLen = formatLenArrs[numI]; // 当前项是几位字符
        let numStrs = nums.map(num => {
          let nStr = num.toString();
          while (nStr.length < formatLen) {
            nStr = `0${nStr}`;
          }
          return nStr;
        })
        // return `(${numStrs.join("|")})`;
        return `${numStrs.length > 1 ? "(" : ""}${numStrs.join("|")}${numStrs.length > 1 ? ")" : ""}`;
      })

      // 3维数组的中间项，可能并不完整，不完整的地方，用“\d+”之类的关键字补齐
      while (singleStrs.length < formatLenArrs.length) {
        const dLen = formatLenArrs[singleStrs.length];
        let addSingleStr = `(\\d{${dLen}})`;
        singleStrs.push(addSingleStr);
      }

      // 将当前日期对应的正则拼接起来
      let timeStr = "";
      for (let i = 0; i < singleStrs.length; ++i) {
        timeStr += `${connectSigns?.[i - 1] || ""}${singleStrs[i]}`;
      }

      return `(${timeStr})`;
    })

    return regExpArr.join("|");
  }

  /** 维持一个二维数组，这个数组的每个维度表示年、月、日、时、分、秒其中一项，最终用来生成数据库筛选正则。（二维数组的第一项表示最早时间，最后一项表示最晚时间） */
  private addTimeNum(timeList: number[][][], curData: { minNum: number, maxNum: number }, effData: { effMin: number, effMax: number }): number[][][] {
    if (!timeList) {
      return null;
    }
    const { minNum, maxNum } = curData;
    const { effMin, effMax } = effData;

    // 左值右值直接放进去
    const firstItemsStr = timeList.length > 0 ? JSON.stringify(timeList[0]) : "";
    const firstItems = firstItemsStr ? JSON.parse(firstItemsStr) : [];
    const lastItemsStr = timeList.length > 0 ? JSON.stringify(timeList[timeList.length - 1]) : "";
    const lastItems = lastItemsStr ? JSON.parse(lastItemsStr) : [];
    if (timeList.length > 0) {
      timeList[0].push([minNum]);
      timeList[timeList.length - 1].push([maxNum]);
    }
    else {
      timeList.push([[minNum]]);
      timeList.push([[maxNum]]);
    }

    // 插入中间值（最早的时间和最晚的时间一致时，当前节点取中间段）
    let middleList = [];
    if (firstItemsStr === lastItemsStr) {
      if (minNum > maxNum) {
        return;
      }
      for (let i = minNum + 1; i < maxNum; ++i) {
        middleList.push(i);
      }
      middleList.length > 0 && timeList.splice(1, 0, [...firstItems, middleList]);
    }
    else {
      middleList = [];
      for (let i = minNum + 1; i <= effMax; ++i) {
        middleList.push(i);
      }
      middleList.length > 0 && timeList.splice(1, 0, [...firstItems, middleList]);

      middleList = [];
      for (let i = effMin; i < maxNum; ++i) {
        middleList.push(i);
      }
      middleList.length > 0 && timeList.splice(timeList.length - 1, 0, [...lastItems, middleList]);
    }

    // 可以返回了
    return timeList;
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
