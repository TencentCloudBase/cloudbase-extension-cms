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
  let { type, value, onChange = () => { }, dateFormatType } = props

  // 纯时间数字，如 23:59:59
  if (type === 'Time') {
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

/** 通用时间、日期范围选择器 */
export const IDateRangePicker: React.FC<{
  type?: DateFieldType
  value?: string[] | number[]
  style?: React.CSSProperties
  onChange?: (v: string[] | number[] | undefined) => void
  dateFormatType?: DateFormatType
}> = (props) => {
  let { type, value, onChange = () => { }, dateFormatType } = props
  const haveNan = ((value || []) as any[]).filter((item: any) => String(item) === "NaN")
  value = haveNan?.length > 0 ? undefined : value

  // 纯时间数字，如 23:59:59
  if (type === 'Time') {
    return <ITimeRangePicker value={value} type={dateFormatType} onChange={onChange} />
  }

  // Unix Timestamp 秒级时间
  let isUnixTimestamp = false;
  const date = (value || []).map(v => {
    let tempV = v;
    if (String(tempV)?.length === 10 && !isNaN(Number(tempV))) {
      isUnixTimestamp = true;
      tempV = Number(tempV) * 1000;
    }
    return tempV;
  }) as any;

  return (
    <DatePicker.RangePicker
      {...props}
      locale={locale}
      value={date?.length > 1 ? [moment(date?.[0]) || null, moment(date?.[1]) || null] : undefined}
      showTime={type === 'DateTime'}
      format={type === 'DateTime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
      onChange={(_, v) => {
        // 如果没有设置 dateFormatType，且原数据格式为 Unix Timestamp，则也按照原格式存储
        if (isUnixTimestamp && !dateFormatType) {
          onChange(v.map(item => (moment(item).unix())))
          return
        }

        // 格式化时间
        const formatDate: number[] | string[] = v.map(item => (item && formatStoreTimeByType(item, dateFormatType, type))) as any
        if ((formatDate as any[]).filter(item => !item).length > 0) {
          return onChange(undefined)
        }
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

/**
 * 时间段选择器
 */
const ITimeRangePicker: React.FC<{
  value?: string[] | number[]
  onChange: (v: number[] | string[] | undefined) => void
  type?: DateFormatType
}> = ({ value, type, onChange }) => {
  const date = (value || []).map(item => (timestampToDateString(item, type)))

  return (
    <TimePicker.RangePicker
      defaultValue={date.length > 1 ? [moment(date?.[0]) || undefined, moment(date?.[1]) || undefined] : undefined}
      onChange={(v, dateString) => {
        // onChange(dateString?.map(str => (dateStringToNumber(str))))
        const formatDate: number[] | string[] = dateString.map(item => (item && dateStringToNumber(item))) as any
        if ((formatDate as any[]).filter(item => !item).length > 0) {
          return onChange(undefined)
        }
        onChange(formatDate)
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
