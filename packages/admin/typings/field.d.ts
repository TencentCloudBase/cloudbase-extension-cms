/**
 * 基本字段类型
 */
type BaseFieldType = 'String' | 'MultiLineString' | 'Number' | 'Boolean'

/**
 * 日期、时间类型，默认存储类型：timestamp-ms
 */
type DateFieldType = 'Date' | 'Time' | 'DateTime'

/**
 * timestamp-ms：unix timestamp 毫秒，数字
 * timestamp-s：unix timestamp 秒，数字
 * date：date object
 * string: 2021-01-05 23:11:11 字符串
 */
type DateFormatType = 'timestamp-ms' | 'timestamp-s' | 'date' | 'string'

/**
 * 资源类型，底层存储文件访问链接
 * Media 包含 audio 和 video
 * TODO: 未来可以统一图片、文件、多媒体等资源类型
 */
type AssetFieldType = 'File' | 'Media' | 'Image'

/**
 * 描述性质的类型
 * 存储值为基础类型，增加了额外的属性
 * TODO: Color
 */
type DescriptiveType = 'Email' | 'Tel' | 'Url' | 'RichText' | 'Markdown'

/**
 * 高级类型
 * 关联类型：_id 或 _id 数组
 * TODO: Location
 */
type AdvancedType = 'Connect' | 'Array' | 'Enum' | 'Object'

/**
 * 废弃类型
 * @deprecated
 */
type DeprecatedType = 'Text'

type SchemaFieldType =
  | BaseFieldType
  | DescriptiveType
  | DateFieldType
  | AssetFieldType
  | AdvancedType
  | DeprecatedType

/**
 * 模型字段描述
 */
interface SchemaField {
  // 32 位 Id，需要手动生成
  id: string

  // 字段类型
  type: SchemaFieldType

  // 展示标题
  displayName: string

  // 在数据库中的字段名
  name: string

  // 字段顺序
  order: number

  // 字段描述
  description: string

  // 是否隐藏
  isHidden: boolean

  // 是否必需字段
  isRequired: boolean

  // 排序字段
  isOrderField: boolean
  orderDirection: 'asc' | 'desc'

  // 是否为系统内置字段
  isSystem: boolean

  // 是否唯一
  isUnique: boolean

  // 在 API 返回结果中隐藏
  isHiddenInApi: boolean

  // 是否加密
  isEncrypted: boolean

  // 默认值
  defaultValue: any

  // 最小长度/值
  min: number

  // 最大长度/值
  max: number

  // 校验
  validator: string

  // 样式属性
  style: {}

  // 连接字段
  connectField: string

  // 连接模型 Id
  connectResource: string

  // 关联多个
  connectMany: boolean

  // 枚举
  // 枚举元素的类型
  enumElementType: 'string' | 'number'
  // 所有枚举元素
  enumElements: { label: string; value: string }[]

  // 允许多个值
  isMultiple: boolean

  // 图片、文件存储链接的形式，fileId 或 https 形式，默认为 true，
  resourceLinkType: 'fileId' | 'https'

  // 时间存储格式
  dateFormatType: 'timestamp-ms' | 'timestamp-s' | 'date' | 'string'

  // 多媒体类型
  mediaType: 'video' | 'music'

  // 是否允许复制
  copyable: boolean
}

/**
 * 模型描述
 */
interface Schema {
  _id: string

  displayName: string

  collectionName: string

  projectId: string

  // 在多个项目之间实现共享
  projectIds: string[]

  fields: SchemaField[]

  searchFields: SchemaField[]

  description: string

  // 文档创建时间字段名
  docCreateTimeField: string

  // 文件更新数据字段名
  docUpdateTimeField: string

  _creatTime: number

  _updateTime: number
}
