import React from 'react'
import { Pie } from '@ant-design/charts'

interface DataItem {
  label: string
  value: number
}

export const PieChart: React.FC<{ data: DataItem[] }> = ({ data }) => {
  const config: any = {
    data,
    radius: 0.7,
    angleField: 'value',
    colorField: 'label',
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    interactions: [{ type: 'element-active' }],
  }

  return <Pie {...config} />
}
