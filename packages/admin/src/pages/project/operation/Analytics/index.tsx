import React, { Suspense } from 'react'
import { Select, Col, Row, Skeleton, Space, Spin } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { getContents } from '@/services/content'
import { useDebounceFn } from '@umijs/hooks'
import { useSetState } from 'react-use'
import { ActivitySchema } from '../Activity/schema'

// 懒加载
const OverviewRow = React.lazy(() => import('./OverviewRow'))
const ConversionFunnel = React.lazy(() => import('./ConversionFunnel'))
const RealTimeView = React.lazy(() => import('./RealTimeView'))
const UserViewSource = React.lazy(() => import('./UserViewSource'))

const { Option } = Select

const colProps = {
  xxl: 8,
  xl: 12,
  lg: 24,
  md: 24,
  sm: 24,
  xs: 24,
}

export default (): React.ReactNode => {
  const { projectId } = useParams<any>()
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state

  const [{ searching, currentActivity }, setState] = useSetState({
    searching: false,
    currentActivity: '',
  })

  // 加载活动
  const { data: activities = [], loading, run } = useRequest<{ data: any[] }>(
    async (searchKey: string) => {
      setState({
        searching: true,
      })
      // 搜索参数
      const fuzzyFilter = searchKey
        ? {
            activityName: searchKey,
          }
        : undefined

      try {
        const { data = [] } = await getContents(projectId, ActivitySchema.collectionName, {
          fuzzyFilter,
        })

        return {
          data,
        }
      } catch (error) {
        return {
          data: [],
        }
      } finally {
        setState({
          searching: false,
        })
      }
    }
  )

  // 搜索活动
  const { run: searchActivity } = useDebounceFn((key) => {
    run(key)
  }, 500)

  // setting 还没有获取到
  if (!setting) {
    return (
      <PageContainer>
        <Skeleton active />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Space className="mb-5">
        <span>活动名</span>
        <Select
          showSearch
          loading={loading}
          filterOption={false}
          style={{ width: 300 }}
          value={currentActivity}
          onChange={(v) => setState({ currentActivity: v })}
          onSearch={searchActivity}
          notFoundContent={searching ? <Spin size="small" /> : null}
        >
          {activities.map((_, i) => (
            <Option key={i} value={_._id}>
              {_.activityName}
            </Option>
          ))}
        </Select>
      </Space>

      <Suspense fallback={<Spin />}>
        <OverviewRow activityId={currentActivity} />
      </Suspense>

      <Row gutter={[24, 24]}>
        <LazyChartCol>
          <UserViewSource
            title="H5 访问累计用户数渠道占比"
            activityId={currentActivity}
            metricName="webPageViewSource"
          />
        </LazyChartCol>
        <LazyChartCol>
          <UserViewSource
            title="跳转小程序累计 UV 渠道占比"
            activityId={currentActivity}
            metricName="miniappViewSource"
          />
        </LazyChartCol>
        <LazyChartCol>
          <ConversionFunnel activityId={currentActivity} />
        </LazyChartCol>
      </Row>

      <Suspense fallback={<Spin />}>
        <RealTimeView activityId={currentActivity} />
      </Suspense>
    </PageContainer>
  )
}

const LazyChartCol: React.FC = ({ children }) => {
  return (
    <Col {...colProps}>
      <Suspense fallback={<Spin />}>{children}</Suspense>
    </Col>
  )
}
