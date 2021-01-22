import React from 'react'
import { Funnel } from '@ant-design/charts'

interface DataItem {
  stage: string
  number: number
}

export const FunnelChart: React.FC<{ data: DataItem[] }> = ({ data }) => {
  const config = {
    data,
    xField: 'stage',
    yField: 'number',
  }

  return <Funnel {...config} />
}
