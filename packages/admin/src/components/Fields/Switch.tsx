import React from 'react'
import { Switch } from 'antd'

/**
 * 将 Switch 转换成符合 Form 表单要求的格式
 */
export const ISwitch: React.FC<{
  // 非显式声明
  value?: boolean
  onChange?: (v: boolean) => void
}> = ({ value, onChange }) => {
  return (
    <Switch checked={value} checkedChildren="True" unCheckedChildren="False" onChange={onChange} />
  )
}
