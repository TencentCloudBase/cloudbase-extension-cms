import React from 'react'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { DatePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/zh_CN'
import { formatTimeByType } from '@/utils'

export const IDatePicker: React.FC<{
  type?: string
  value?: string | number
  style?: React.CSSProperties
  onChange?: (v: string | number) => void
  dateFormatType?: 'timestamp-ms' | 'timestamp-s' | 'date' | 'string'
}> = (props) => {
  let { type, value, onChange = () => {}, dateFormatType } = props

  // Unix Timestamp 秒级时间
  const isUnixTimestamp = String(value)?.length === 10 && !isNaN(Number(value))
  if (isUnixTimestamp) {
    value = Number(value) * 1000
  }

  return (
    <DatePicker
      {...props}
      locale={locale}
      value={value ? moment(value) : null}
      showTime={type === 'DateTime'}
      format={type === 'DateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
      onChange={(_, v) => {
        // 如果没有设置 dateFormatType，且原数据格式为 Unix Timestamp，则也按照原格式存储
        if (isUnixTimestamp && !dateFormatType) {
          onChange(moment(v).unix())
          return
        }

        // 格式化时间
        const formatDate: number | string = formatTimeByType(v, dateFormatType, type)
        onChange(formatDate)
      }}
    />
  )
}
