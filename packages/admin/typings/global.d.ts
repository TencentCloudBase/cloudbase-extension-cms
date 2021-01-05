/**
 * timestamp-ms：unix timestamp 毫秒，数字
 * timestamp-s：unix timestamp 秒，数字
 * date：date object
 * string: 2021-01-05 23:11:11 字符串
 */
type DateFormatType = 'timestamp-ms' | 'timestamp-s' | 'date' | 'string'

/**
 * 日期、时间类型，默认存储类型：timestamp-ms
 */
type DateFieldType = 'Date' | 'Time' | 'DateTime'

/**
 * 文件类型底层存储文件访问链接
 * 关联类型：_id 或 _id 数组
 * TODO：ENUM
 */
type NormalFieldType =
  | 'String'
  | 'MultiLineString'
  | 'Number'
  | 'Boolean'
  | 'File'
  | 'Media' // audio 和 video
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
  | 'Text' // 废弃

type SchemaFieldType = NormalFieldType | DateFieldType
