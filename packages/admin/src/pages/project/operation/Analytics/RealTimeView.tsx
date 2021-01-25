import React from 'react'
import { useRequest } from 'umi'
import ProCard from '@ant-design/pro-card'
import { DualAxes } from '@ant-design/charts'
import { DatePicker, Space, Spin } from 'antd'
import ChannelSelector from '@/components/ChannelSelector'
import { PieChartTwoTone } from '@ant-design/icons'
import { getAnalyticsData } from '@/services/operation'
import { useSetState } from 'react-use'

const { RangePicker } = DatePicker

const cardStyle = { margin: '24px 0', height: '600px' }

const RealTimeView: React.FC<{ activityId: string }> = ({ activityId }) => {
  const [{ channel }, setState] = useSetState({
    channel: '',
    dateRange: '',
  })

  // 获取统计数据
  const { data, loading } = useRequest(
    async () => {
      if (!activityId) return
      const res = await getAnalyticsData({ activityId, metricName: 'realtimeView' })
      return res
    },
    {
      refreshDeps: [activityId],
    }
  )

  if (!activityId || !data) {
    return (
      <ProCard title="实时访问曲线" style={cardStyle}>
        <div className="flex justify-center items-center h-full">
          <Space direction="vertical" align="center" size="large">
            <PieChartTwoTone style={{ fontSize: '48px' }} />
            {loading ? (
              <Spin />
            ) : (
              <p className="text-xl">{activityId ? '数据为空' : '请选择活动'}</p>
            )}
          </Space>
        </div>
      </ProCard>
    )
  }

  return (
    <ProCard title="实时访问曲线" style={{ margin: '24px 0', height: '600px' }}>
      {/* 选择渠道和时间 */}
      <Space size="large">
        <ChannelSelector
          onSelect={(v) =>
            setState({
              channel: v,
            })
          }
        />
        <RangePicker
          showTime
          onChange={(_, v) => {
            const [startTime, endTime] = v
            // setState({
            //   dateRange: v,
            // })
          }}
        />
      </Space>

      {/* 限制图表的高度 */}
      <div style={{ height: '450px', position: 'relative', marginTop: '20px' }}>
        <AccessDualAxes data={data} />
      </div>
    </ProCard>
  )
}

interface DataItem {
  time: string
  value: number
  type: string
}

/**
 * 双折线图标
 */
const AccessDualAxes: React.FC<{
  data: {
    webPageViewUsers: DataItem[]
    miniappViewUsers: DataItem[]
    conversionRate: DataItem[]
  }
}> = ({ data = {} }) => {
  const { webPageViewUsers = [], miniappViewUsers = [], conversionRate = [] } = data

  const config = {
    data: [[...webPageViewUsers, ...miniappViewUsers], conversionRate],
    xField: 'time',
    yField: ['value', 'percent'],
    meta: {
      type: {
        formatter: (v: string) => {
          const mapping = {
            webPageView: 'H5 访问用户数',
            miniappView: '小程序跳转用户数',
          }
          return mapping[v]
        },
      },
      percent: {
        alias: '转换率',
      },
    },
    geometryOptions: [
      {
        geometry: 'line',
        seriesField: 'type',
        lineStyle: {
          lineWidth: 3,
          lineDash: [5, 5],
        },
        smooth: true,
      },
      {
        geometry: 'line',
        smooth: true,
      },
    ],
  }
  return (
    <DualAxes
      {...config}
      yAxis={[
        {
          title: {
            text: '访问用户数',
            style: {
              fontSize: 18,
            },
          },
        },
      ]}
    />
  )
}

export default RealTimeView
