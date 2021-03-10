type SystemControlFields = '_createTime' | '_updateTime'

type SchemaFieldType =
  | 'String'
  | 'MultiLineString'
  | 'Number'
  | 'Boolean'
  | 'DateTime'
  | 'Date'
  | 'File'
  | 'Image'
  | 'Email'
  | 'Tel'
  | 'Url'
  | 'RichText'
  | 'Markdown'
  | 'Connect'
  | 'Array'
  | 'Enum'
  | 'Object'

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

  // 是否为系统内置字段
  isSystem: boolean

  // 是否隐藏
  isHidden: boolean

  // 是否必需字段
  isRequired: boolean

  // 排序字段
  isOrderField: boolean
  orderDirection: 'asc' | 'desc'

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

  // 连接资源 Id
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
}

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

interface Project {
  _id: string

  name: string

  customId: string

  description: string

  // 项目封面图
  cover?: string

  // 是否开启 Api 访问
  enableApiAccess: boolean

  // api 访问路径
  apiAccessPath: string

  // 可读集合
  readableCollections: string[]

  // 可修改的集合
  modifiableCollections: string[]

  // 可删除的集合
  deletableCollections: string[]
}
