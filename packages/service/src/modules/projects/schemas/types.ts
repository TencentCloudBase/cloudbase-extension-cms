import { IsNotEmpty } from 'class-validator'

export class SchemaField {
  id: string

  // 字段类型
  @IsNotEmpty()
  type: string

  // 展示标题
  @IsNotEmpty()
  displayName: string

  // 在数据库中的字段名
  @IsNotEmpty()
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

  // 枚举类型
  enumElements: { label: string; value: string }[]
}

export class Schema {
  _id: string

  displayName: string

  collectionName: string

  projectId: string

  fields: SchemaField[]

  description: string

  _creatTime: number

  _updateTime: number
}
