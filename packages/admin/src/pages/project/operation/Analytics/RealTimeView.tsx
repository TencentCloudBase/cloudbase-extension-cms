import React from 'react'
import { useRequest } from 'umi'
import ProCard from '@ant-design/pro-card'
import { DualAxes } from '@ant-design/charts'
import { DatePicker, Space, Spin } from 'antd'
import ChannelSelector from '@/components/ChannelSelector'
import { PieChartTwoTone } from '@ant-design/icons'
import { getRealtimeAnalyticsData } from '@/services/operation'
import { useSetState } from 'react-use'
import { Moment } from '@/utils'
import { DualAxesConfig } from '@ant-design/charts/es/dualAxes'

const { RangePicker } = DatePicker

const RealTimeView: React.FC<{ activityId: string }> = ({ activityId }) => {
  const latestMinute = Math.floor(Moment().get('minute') / 5) * 5

  const [{ channelId, dateRange }, setState] = useSetState<any>({
    channelId: '_cms_sms_',
    dateRange: [],
  })

  // 获取统计数据
  const { data = {}, loading } = useRequest(
    async () => {
      if (!activityId) return
      let [startTime, endTime] = dateRange

      // 初次加载时，时间为空
      if (!startTime || !endTime) {
        const latestMinute = Math.floor(Moment().get('minute') / 5) * 5
        console.log(latestMinute, Moment().set('second', 0).set('minute', latestMinute).unix())
        endTime = Moment().set('second', 0).set('minute', latestMinute).unix()
        startTime = Moment(endTime * 1000)
          .subtract(12, 'hour')
          .unix()
      }

      const res = await getRealtimeAnalyticsData({
        endTime,
        startTime,
        channelId,
        activityId,
      })
      return res
    },
    {
      refreshDeps: [activityId, channelId, dateRange],
    }
  )

  return (
    <ProCard title="实时访问曲线" style={{ margin: '24px 0', height: '600px' }}>
      {/* 选择渠道和时间 */}
      <Space size="large">
        <ChannelSelector
          onSelect={(v) =>
            setState({
              channelId: v,
            })
          }
        />
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          minuteStep={5}
          defaultValue={[
            Moment().set('second', 0).set('minute', latestMinute).subtract(12, 'hour'),
            Moment().set('second', 0).set('minute', latestMinute),
          ]}
          onChange={(v) => {
            console.log(v?.[0]?.unix())

            setState({
              dateRange: [v?.[0]?.unix(), v?.[1]?.unix()],
            })
          }}
        />
      </Space>

      {/* 限制图表的高度 */}
      <div style={{ height: '450px', position: 'relative', marginTop: '20px' }}>
        {loading ? <ChartTip loading /> : <AccessDualAxes data={data} />}
      </div>
    </ProCard>
  )
}

const ChartTip = ({ loading, text }: { loading?: boolean; text?: string }) => (
  <div className="flex justify-center items-center h-full">
    <Space direction="vertical" align="center" size="large">
      <PieChartTwoTone style={{ fontSize: '48px' }} />
      {loading ? <Spin /> : <p className="text-xl">{text}</p>}
    </Space>
  </div>
)

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
    conversionRate: any[]
    webPageViewUsers: DataItem[]
    miniappViewUsers: DataItem[]
  }
}> = ({ data = {} }) => {
  const { webPageViewUsers = [], miniappViewUsers = [], conversionRate = [] } = data

  const config: DualAxesConfig = {
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
        formatter: (v: string) => {
          return `${Number(v) * 100}%`
        },
      },
    },
    geometryOptions: [
      {
        geometry: 'line',
        seriesField: 'type',
        smooth: true,
      },
      {
        geometry: 'line',
        smooth: true,
        lineStyle: {
          stroke: '#FAAD14',
        },
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
        {
          title: {
            text: '转换率',
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
