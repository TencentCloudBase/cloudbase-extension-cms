import React from 'react'
import { Input, InputNumber } from 'antd'
import { ISwitch, IDatePicker } from '@/components/Fields'

const ObjectInput: React.FC<{
  value?: any
  onChange?: any
}> = ({ value, onChange }) => {
  let formatValue = value
  if (typeof value === 'object') {
    formatValue = JSON.stringify(value)
  }

  return <Input.TextArea value={formatValue} placeholder="请输入 JSON 字符串" onChange={onChange} />
}

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
    case 'Object':
      return <ObjectInput />
    default:
      return <Input placeholder="此值的默认值" />
  }
}
