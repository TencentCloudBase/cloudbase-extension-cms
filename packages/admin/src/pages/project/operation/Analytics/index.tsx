import React, { Suspense } from 'react'
import { Select, Col, Row, Skeleton, Space, Spin, Button, Result } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history, useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { getContents } from '@/services/content'
import { useDebounceFn } from '@umijs/hooks'
import { useSetState } from 'react-use'
import { AlertTwoTone } from '@ant-design/icons'
import { FunnelChart, PieChart } from '@/components/Charts'
import { getAnalyticsData } from '@/services/operation'
import { ActivitySchema } from '../Activity/schema'
import DataSource from './DataSource'

// 懒加载
const OverviewRow = React.lazy(() => import('./OverviewRow'))
const RealTimeView = React.lazy(() => import('./RealTimeView'))

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

        // 设置默认的活动
        if (!currentActivity && data?.length) {
          setState({
            currentActivity: data[0]?._id,
          })
        }

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

  // 获取统计数据
  const { data = {}, loading: metricLoading } = useRequest(
    async () => {
      if (!currentActivity) return
      return getAnalyticsData({ activityId: currentActivity })
    },
    {
      refreshDeps: [currentActivity],
    }
  )

  // setting 还没有获取到
  if (!setting) {
    return (
      <PageContainer>
        <Skeleton active />
      </PageContainer>
    )
  }

  // 不存在活动，提示创建活动
  if (!loading && !activities?.length) {
    return (
      <PageContainer>
        <Result
          icon={<AlertTwoTone />}
          title="您还没有创建任何活动，统计数据为空！"
          extra={
            <Button
              type="primary"
              onClick={() => {
                history.push(`/${projectId}/operation/activity`)
              }}
            >
              创建活动
            </Button>
          }
        />
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
        <OverviewRow data={data?.overviewCount} loading={metricLoading} />
      </Suspense>

      <Row gutter={[24, 24]}>
        <Col {...colProps}>
          <DataSource
            title="H5 访问累计用户数渠道占比"
            loading={metricLoading}
            data={data['webPageViewSource']}
          >
            <PieChart data={[]} />
          </DataSource>
        </Col>
        <Col {...colProps}>
          <DataSource
            title="跳转小程序累计 UV 渠道占比"
            loading={metricLoading}
            data={data['miniappViewSource']}
          >
            <PieChart data={[]} />
          </DataSource>
        </Col>
        <Col {...colProps}>
          <DataSource title="短信转化率" loading={metricLoading} data={data['messageConversion']}>
            <FunnelChart data={[]} />
          </DataSource>
        </Col>
      </Row>

      {/* 实时访问数据 */}
      {/* 
      <Suspense fallback={<Spin />}>
        <RealTimeView activityId={currentActivity} />
      </Suspense> */}
    </PageContainer>
  )
}
