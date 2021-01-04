type DateFormatType = 'timestamp-ms' | 'timestamp-s' | 'date' | 'string'

type DateFieldType = 'Date' | 'Time' | 'DateTime'

type NormalFieldType =
  | 'String'
  | 'MultiLineString'
  | 'Number'
  | 'Boolean'
  | 'File'
  | 'Media'
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
  | 'Text'

type SchemaFieldType = NormalFieldType | DateFieldType
