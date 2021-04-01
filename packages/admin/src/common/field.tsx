import React from 'react'

interface FieldType {
  name: string
  type: SchemaFieldType
  icon: React.ReactNode
  description?: string
}

/**
 * 当期支持的字段类型
 */
export const FieldTypes: FieldType[] = [
  // 字符串：单行
  {
    type: 'String',
    name: '单行字符串',
    icon: <i className="gg-format-color" />,
  },
  // 字符串：多行
  {
    type: 'MultiLineString',
    name: '多行字符串',
    icon: <i className="gg-format-justify" />,
  },
  // 数字：整形、浮点型
  {
    name: '数字',
    type: 'Number',
    icon: <i className="gg-math-percent" />,
  },
  // 布尔值
  {
    type: 'Boolean',
    name: '布尔值',
    icon: <i className="gg-check" />,
  },
  {
    type: 'Enum',
    name: '枚举',
    icon: <i className="gg-template" />,
  },
  // 时间
  {
    type: 'Date',
    name: '日期',
    icon: <i className="gg-calendar-dates" />,
    description: '只包含日期，如 2020-09-01',
  },
  {
    type: 'DateTime',
    name: '日期与时间',
    icon: <i className="gg-calendar-dates" />,
    description: '包含日期和时间，如 2020-09-01 10:11:07',
  },
  // **颜色：Color**
  // 文件：File
  {
    type: 'File',
    name: '文件',
    icon: <i className="gg-file" />,
  },
  // 图片：Image
  {
    type: 'Image',
    name: '图片',
    icon: <i className="gg-image" />,
  },
  {
    type: 'Media',
    name: '多媒体',
    icon: <i className="gg-play-button-r" />,
  },
  // 邮箱地址
  {
    type: 'Email',
    name: '邮箱地址',
    icon: <i className="gg-mail" />,
  },
  // 电话号码
  {
    type: 'Tel',
    name: '电话号码',
    icon: <i className="gg-phone" />,
  },
  // 网址
  {
    type: 'Url',
    name: '网址',
    icon: <i className="gg-link" />,
  },
  // 富文本
  {
    type: 'RichText',
    name: '富文本',
    icon: <i className="gg-file-document" />,
  },
  // Markdown
  {
    type: 'Markdown',
    name: 'Markdown',
    icon: <i className="gg-chevron-double-down-o" />,
  },
  {
    type: 'Connect',
    name: '关联',
    icon: <i className="gg-arrow-top-right-r" />,
  },
  {
    type: 'Array',
    name: '数组',
    icon: <i className="gg-list" />,
  },
  {
    type: 'Object',
    name: 'JSON 对象',
    icon: <i className="gg-list-tree" />,
    description: '可以自由存储类 JSON 对象和数组（非 JSON 字符串）',
  },
]

export const DOC_ID_FIELD = {
  displayName: '_id',
  id: '_id',
  name: '_id',
  type: 'String',
  isSystem: true,
  copyable: true,
  description: '系统字段，请勿随意修改',
}

/**
 * 系统默认字段
 */
export const SYSTEM_FIELDS: any[] = [
  DOC_ID_FIELD,
  {
    displayName: '创建时间',
    id: '_createTime',
    name: '_createTime',
    type: 'DateTime',
    isSystem: true,
    dateFormatType: 'timestamp-ms',
    description: '系统字段，请勿随意修改',
  },
  {
    displayName: '修改时间',
    id: '_updateTime',
    name: '_updateTime',
    type: 'DateTime',
    isSystem: true,
    dateFormatType: 'timestamp-ms',
    description: '系统字段，请勿随意修改',
  },
]
