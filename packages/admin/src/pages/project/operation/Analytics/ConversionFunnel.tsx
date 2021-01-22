import React from 'react'
import { Space, Spin } from 'antd'
import ProCard from '@ant-design/pro-card'
import { FunnelChart } from '@/components/Charts'
import { useParams, useRequest } from 'umi'
import { getAnalyticsData } from '@/services/operation'
import { PieChartTwoTone } from '@ant-design/icons'

const cardStyle = {
  height: '480px',
}

const ConversionFunnel: React.FC<{ activityId: string }> = ({ activityId }) => {
  const { projectId } = useParams<any>()

  // 获取统计数据
  const { data, loading } = useRequest(
    async () => {
      //
      if (!activityId) return
      const res = await getAnalyticsData(projectId, { activityId, metricName: 'messageConversion' })
      return res
    },
    {
      refreshDeps: [activityId],
    }
  )

  // 加载中
  if (!activityId || !data?.length) {
    return (
      <ProCard title="短信转化率" style={cardStyle}>
        <div className="flex justify-center items-center h-full">
          <Space direction="vertical" align="center" size="large">
            <PieChartTwoTone style={{ fontSize: '48px' }} />
            {loading ? <Spin /> : <p className="text-xl">数据为空</p>}
          </Space>
        </div>
      </ProCard>
    )
  }

  return (
    <ProCard title="短信转化率">
      <FunnelChart data={data} />
    </ProCard>
  )
}

export default ConversionFunnel
