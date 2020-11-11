import React from 'react'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { DatePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/zh_CN'

export const IDatePicker: React.FC<{
  type?: string
  value?: string | number
  onChange?: (v: string | number) => void
}> = (props) => {
  let { type, value, onChange = () => {} } = props

  // Unix Timestamp 秒级时间
  const isUnixTimestamp = String(value)?.length === 10 && !isNaN(Number(value))
  if (isUnixTimestamp) {
    value = Number(value) * 1000
  }

  return (
    <DatePicker
      locale={locale}
      value={value ? moment(value) : null}
      showTime={type === 'DateTime'}
      format={type === 'DateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
      onChange={(_, v) => {
        // Unix Timestamp 也按照原格式存储
        if (isUnixTimestamp) {
          onChange(moment(v).unix())
        } else {
          onChange(moment(v).valueOf())
        }
      }}
    />
  )
}
