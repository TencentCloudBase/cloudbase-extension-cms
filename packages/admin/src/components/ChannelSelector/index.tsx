import React from 'react'
import { Space, Typography, Select } from 'antd'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'

const { Option } = Select
const { Text } = Typography

const DefaultChannel = [
  {
    value: '_cms_sms_',
    label: '短信',
  },
]

const ChannelSelector: React.FC<{ onSelect: (v: string) => void }> = ({ onSelect }) => {
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { setting } = ctx.state

  const { activityChannels = [] } = setting

  return (
    <Space>
      <Text>投放渠道</Text>
      <Select
        style={{ width: 200 }}
        onChange={(v) => onSelect(v)}
        defaultValue={DefaultChannel[0].value}
      >
        {DefaultChannel.concat(activityChannels)?.map((_: ActivityChannel, index) => (
          <Option key={index} value={_.value}>
            {_.label}
          </Option>
        ))}
      </Select>
    </Space>
  )
}

export default ChannelSelector
