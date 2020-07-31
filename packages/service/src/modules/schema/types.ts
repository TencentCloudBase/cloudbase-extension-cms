import { IsNotEmpty } from 'class-validator'

export class SchemaFieldV1 {
    // 字段类型
    @IsNotEmpty()
    fieldType: string

    // 展示标题
    @IsNotEmpty()
    fieldLabel: string

    // 在数据库中的字段名
    @IsNotEmpty()
    fieldName: string

    // 字段描述
    helpText: string

    // 是否隐藏
    hidden: boolean

    // 是否必需字段
    isRequired: boolean

    // 默认值
    defaultValue: any

    stringMinLength: number

    stringMaxLength: number

    // 连接字段
    connectField: String

    // 连接资源 Id
    connectResource: string
}

export class SchemaFieldV2 {
    // 字段类型
    @IsNotEmpty()
    type: string

    // 展示标题
    @IsNotEmpty()
    display_name: string

    // 在数据库中的字段名
    @IsNotEmpty()
    name: string

    // 字段描述
    description: string

    // 默认排序字段
    order_by: string

    // 是否隐藏
    is_hidden: boolean

    // 是否必需字段
    is_required: boolean

    // 是否唯一
    is_unique: boolean

    // 在 API 返回结果中隐藏
    is_hidden_in_api: boolean

    // 是否加密
    is_encrypted: boolean

    // 默认值
    default_value: any

    // 最小长度/值
    min: number

    // 最大长度/值
    max: number

    // 校验
    validator: string

    // 样式属性
    style: {}

    // 联合类型记录值
    union: {}

    // 枚举类型
    enum: {}
}

// schema v1
export class SchemaV1 {
    _id: string

    // 展示名称
    label: string

    collectionName: string

    fields: SchemaFieldV1[]

    description: string

    createTime: string

    updateTime: string
}

export class SchemaV2 {
    id: string

    @IsNotEmpty()
    display_name: string

    @IsNotEmpty()
    collection_name: string

    @IsNotEmpty()
    project_id: string

    fields: SchemaFieldV2[]

    description: string

    _creatTime: number

    _updateTime: number

    // Schema 协议版本 v2
    _version: '2.0'
}

export type CompatibleSchema = SchemaV1 & SchemaV2
