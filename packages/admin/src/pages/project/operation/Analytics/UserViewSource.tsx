import React from 'react'
import ProCard from '@ant-design/pro-card'
import { PieChart } from '@/components/Charts'
import { useParams, useRequest } from 'umi'
import { getAnalyticsData } from '@/services/operation'
import { PieChartTwoTone } from '@ant-design/icons'
import { Space, Spin } from 'antd'

const cardStyle = {
  height: '480px',
}

const UserViewSource: React.FC<{ title: string; metricName: string; activityId: string }> = ({
  title,
  activityId,
  metricName,
}) => {
  const { projectId } = useParams<any>()

  // 获取统计数据
  const { data, loading } = useRequest(
    async () => {
      //
      if (!activityId) return
      const res = await getAnalyticsData(projectId, { activityId, metricName })
      return res
    },
    {
      refreshDeps: [activityId],
    }
  )

  if (!activityId || !data?.length) {
    return (
      <ProCard title={title} style={cardStyle}>
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
    <ProCard title={title} style={cardStyle}>
      <PieChart data={data} />
    </ProCard>
  )
}

export default UserViewSource
