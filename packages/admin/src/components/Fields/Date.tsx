import React from 'react'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { DatePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/zh_CN'

export const IDatePicker: React.FC<{
  type?: string
  value?: string
  onChange?: (v: string | number) => void
}> = (props) => {
  let { type, value, onChange = () => {} } = props

  return (
    <DatePicker
      locale={locale}
      value={value ? moment(value) : null}
      showTime={type === 'DateTime'}
      format={type === 'DateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
      onChange={(_, v) => onChange(moment(v).valueOf())}
    />
  )
}
