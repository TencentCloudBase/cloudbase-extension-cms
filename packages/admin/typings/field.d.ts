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
