import React from 'react'
import { Col, Row, Card, Typography, Spin } from 'antd'
import { useRequest } from 'umi'
import { getAnalyticsData } from '@/services/operation'

const { Text } = Typography

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 8,
  style: { marginBottom: 24 },
}

const OverviewRow: React.FC<{ activityId: string }> = ({ activityId }) => {
  // 获取统计数据
  const { data, loading } = useRequest(
    async () => {
      if (!activityId) return
      const res = await getAnalyticsData({ activityId, metricName: 'overviewCount' })
      return res
    },
    {
      refreshDeps: [activityId],
    }
  )

  return (
    <Row gutter={24}>
      <ShowCardCol loading={loading} title="活动下发号码总数" count={data?.phoneNumberCount} />
      <ShowCardCol loading={loading} title="H5 访问用户总数" count={data?.webPageViewCount} />
      <ShowCardCol loading={loading} title="跳转小程序用户总数" count={data?.miniappViewCount} />
    </Row>
  )
}

const ShowCardCol: React.FC<{ loading: boolean; title: string; count: number }> = ({
  loading,
  title,
  count,
}) => {
  return (
    <Col {...topColResponsiveProps}>
      <Card>
        <Text strong>{title}</Text>
        <h3 className="text-4xl">{loading ? <Spin /> : count || 0}</h3>
      </Card>
    </Col>
  )
}

export default OverviewRow
