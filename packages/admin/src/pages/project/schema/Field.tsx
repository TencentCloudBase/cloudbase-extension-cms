import React from 'react'
import { Input, InputNumber } from 'antd'
import { ISwitch, IDatePicker } from '@/components/Fields'

/**
 * 获取字段默认值的输入 JSX
 */
export const getFieldDefaultValueInput = (type: string) => {
  switch (type) {
    case 'Number':
      return <InputNumber style={{ width: '50%' }} placeholder="此值的默认值" />
    case 'Boolean':
      return <ISwitch />
    case 'Date':
    case 'DateTime':
      return <IDatePicker type={type} />
    default:
      return <Input placeholder="此值的默认值" />
  }
}
