import React from 'react'
import { Col, Row, Card, Typography, Spin, Space, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 8,
  style: { marginBottom: 24 },
}

const OverviewRow: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  return (
    <Row gutter={24}>
      <ShowCardCol loading={loading} title="活动下发号码总数" count={data?.phoneNumberCount || 0} />
      <ShowCardCol
        loading={loading}
        title={
          <Space>
            <span>H5 访问用户总数</span>
            <Tooltip title="每个用户打开 H5 后访问会话都会生成一个会话 ID，会通过会话 ID 去重">
              <QuestionCircleOutlined style={{ fontSize: '14px' }} />
            </Tooltip>
          </Space>
        }
        count={data?.webPageViewCount || 0}
      />
      <ShowCardCol
        loading={loading}
        title={
          <Space>
            <span>跳转小程序用户总数</span>
            <Tooltip title="跳转小程序用户总数，会通过 OpenID 去重。如果前天，昨天同一个 OpenID 访问会被作为1个">
              <QuestionCircleOutlined style={{ fontSize: '14px' }} />
            </Tooltip>
          </Space>
        }
        count={data?.miniappViewCount || 0}
      />
    </Row>
  )
}

const ShowCardCol: React.FC<{ loading: boolean; title: React.ReactNode; count: number }> = ({
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
