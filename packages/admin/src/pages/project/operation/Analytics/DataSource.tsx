import React from 'react'
import { useRequest } from 'umi'
import { Space, Spin } from 'antd'
import ProCard from '@ant-design/pro-card'
import { getAnalyticsData } from '@/services/operation'
import { PieChartTwoTone } from '@ant-design/icons'

const cardStyle = {
  height: '480px',
}

/**
 * 获取 metric 对应的数据
 */
const DataSource: React.FC<{ activityId: string; title: string; metricName: string }> = ({
  title,
  children,
  activityId,
  metricName,
}) => {
  // 获取统计数据
  const { data, loading } = useRequest(
    async () => {
      if (!activityId) return
      const res = await getAnalyticsData({ activityId, metricName })
      return res
    },
    {
      refreshDeps: [activityId],
    }
  )

  // 加载中
  if (!activityId || !data?.length) {
    return (
      <ProCard title={title} style={cardStyle}>
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

  // set data
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { data })
    }
    return child
  })

  return <ProCard title={title}>{childrenWithProps}</ProCard>
}

export default DataSource
