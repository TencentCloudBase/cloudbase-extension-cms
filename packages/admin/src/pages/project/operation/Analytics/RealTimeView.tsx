import React from 'react'
import { useRequest } from 'umi'
import ProCard from '@ant-design/pro-card'
import { Line } from '@ant-design/charts'
import { DatePicker, Space, Spin } from 'antd'
import ChannelSelector from '@/components/ChannelSelector'
import { PieChartTwoTone } from '@ant-design/icons'
import { getRealtimeAnalyticsData } from '@/services/operation'
import { useSetState } from 'react-use'
import { Moment } from '@/utils'

const { RangePicker } = DatePicker

const RealTimeView: React.FC<{ activityId: string }> = ({ activityId }) => {
  const [{ channelId, dateRange }, setState] = useSetState<any>({
    channelId: '_cms_sms_',
    dateRange: [],
  })

  // 获取统计数据
  const { data = {}, loading } = useRequest(
    async () => {
      if (!activityId) return
      const [startTime, endTime] = dateRange

      const res = await getRealtimeAnalyticsData({
        activityId,
        channelId,
        startTime: startTime ? Moment(startTime).unix() : Moment().subtract(1, 'day').unix(),
        endTime: Moment(endTime).unix(),
      })
      console.log(res)
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
          defaultValue={[Moment().subtract(1, 'day'), Moment()]}
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
    webPageViewUsers: DataItem[]
    miniappViewUsers: DataItem[]
  }
}> = ({ data = {} }) => {
  const { webPageViewUsers = [], miniappViewUsers = [] } = data

  const config = {
    data: [...webPageViewUsers, ...miniappViewUsers],
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
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
    },
    smooth: true,
  }

  return (
    <Line
      {...config}
      yAxis={{
        title: {
          text: '访问用户数',
          style: {
            fontSize: 18,
          },
        },
      }}
    />
  )
}

// 双曲线配置
// const config = {
//   data: [[...webPageViewUsers, ...miniappViewUsers]],
//   xField: 'time',
//   yField: ['value', 'percent'],
//   meta: {
//     type: {
//       formatter: (v: string) => {
//         const mapping = {
//           webPageView: 'H5 访问用户数',
//           miniappView: '小程序跳转用户数',
//         }
//         return mapping[v]
//       },
//     },
//     percent: {
//       alias: '转换率',
//     },
//   },
//   geometryOptions: [
//     {
//       geometry: 'line',
//       seriesField: 'type',
//       lineStyle: {
//         lineWidth: 3,
//         lineDash: [5, 5],
//       },
//       smooth: true,
//     },
//     {
//       geometry: 'line',
//       smooth: true,
//     },
//   ],
// }

export default RealTimeView
