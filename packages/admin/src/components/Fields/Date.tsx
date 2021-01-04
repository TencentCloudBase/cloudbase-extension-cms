import React from 'react'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { DatePicker, TimePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/zh_CN'
import { formatStoreTimeByType, getFullDate, timestampToString } from '@/utils'

/**
 * 通用时间、日期选择器
 */
export const IDatePicker: React.FC<{
  type?: DateFieldType
  value?: string | number
  style?: React.CSSProperties
  onChange?: (v: string | number) => void
  dateFormatType?: DateFormatType
}> = (props) => {
  let { type, value, onChange = () => {}, dateFormatType } = props

  // 纯时间数字，如 23:59:59
  const isPureTime = String(value)?.length < 10 && !isNaN(Number(value))
  if (type === 'Time' || isPureTime) {
    return <ITimePicker value={value || 0} type={dateFormatType} onChange={onChange} />
  }

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
        const formatDate: number | string = formatStoreTimeByType(v, dateFormatType, type)
        onChange(formatDate)
      }}
    />
  )
}

/**
 * 时间选择器
 */
const ITimePicker: React.FC<{
  value: string | number
  onChange: (v: number) => void
  type?: DateFormatType
}> = ({ value, type, onChange }) => {
  const date = timestampToDateString(value, type)

  return (
    <TimePicker
      defaultValue={moment(date)}
      onChange={(v, dateString) => {
        onChange(dateStringToNumber(dateString))
      }}
    />
  )
}

// 毫秒级
const radix = [3600000, 60000, 1000]

// 将 time 转换成 2021-01-01 10:00:01 的形式
const timestampToDateString = (time: number | string, type: DateFormatType = 'timestamp-ms') => {
  const dateString = getFullDate()
  const timeString = timestampToString(time, type)

  return `${dateString} ${timeString}`
}

/**
 * 将 23:05:01 的字符串转换成 83101000 数字
 */
const dateStringToNumber = (date: string): number =>
  date
    .split(':')
    .map(Number)
    .reduce((prev, now, index) => prev + now * radix[index], 0)
