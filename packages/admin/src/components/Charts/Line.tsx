import React, { useState, useEffect } from 'react'
import { Line } from '@ant-design/charts'

export const LineChart: React.FC<any> = (props) => {
  const [data, setData] = useState([])
  useEffect(() => {}, [])

  const config = {
    data: data,
    xField: 'year',
    yField: 'value',
    seriesField: 'category',
    xAxis: { type: 'time' },
    yAxis: {
      label: {
        formatter: function formatter(v: any) {
          return ''.concat(v).replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
            return ''.concat(s, ',')
          })
        },
      },
    },
  }

  return <Line {...config} {...props} />
}
