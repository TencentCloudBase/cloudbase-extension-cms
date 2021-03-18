import React, { Suspense, useMemo } from 'react'
import { Select, Col, Row, Skeleton, Space, Spin, Button, Result, Tooltip } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { useRequest } from 'umi'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { getContents } from '@/services/content'
import { useDebounceFn } from '@umijs/hooks'
import { useSetState } from 'react-use'
import { AlertTwoTone, QuestionCircleOutlined } from '@ant-design/icons'
import { FunnelChart, PieChart } from '@/components/Charts'
import { getAnalyticsData } from '@/services/operation'
import { getHour, getProjectId, redirectTo } from '@/utils'
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
  const projectId = getProjectId()
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
                redirectTo('operation/activity')
              }}
            >
              创建活动
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const nowHour = useMemo(() => getHour(), [])

  return (
    <PageContainer content="数据统计分析将提供活动数据统计与转化率分析，助力运营成功">
      <div className="flex items-center justify-between mb-5">
        <Space>
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
        {data?.webPageViewSource === '-1' && nowHour < 6 && (
          <Space>
            <span>昨日数据尚未更新</span>
            <Tooltip title="数据更新一般在每日 6 时左右完成">
              <QuestionCircleOutlined style={{ fontSize: '14px' }} />
            </Tooltip>
          </Space>
        )}
      </div>

      <Suspense fallback={<Spin />}>
        <OverviewRow data={data?.overviewCount} loading={metricLoading} />
      </Suspense>

      <Row gutter={[24, 24]}>
        <Col {...colProps}>
          <DataSource
            title={
              <Space>
                <span>H5 访问用户总数（渠道占比）</span>
                <Tooltip title="每个用户打开 H5 后访问会话都会生成一个会话 ID，会通过会话 ID 去重">
                  <QuestionCircleOutlined style={{ fontSize: '14px' }} />
                </Tooltip>
              </Space>
            }
            loading={metricLoading}
            data={data['webPageViewSource']}
          >
            <PieChart data={[]} />
          </DataSource>
        </Col>
        <Col {...colProps}>
          <DataSource
            title={
              <Space>
                <span>跳转小程序用户总数（渠道占比）</span>
                <Tooltip title="跳转小程序用户总数，会通过 OpenID 去重。如果前天，昨天同一个 OpenID 访问会被作为1个">
                  <QuestionCircleOutlined style={{ fontSize: '14px' }} />
                </Tooltip>
              </Space>
            }
            loading={metricLoading}
            data={data['miniappViewSource']}
          >
            <PieChart data={[]} />
          </DataSource>
        </Col>
        <Col {...colProps}>
          <DataSource
            title={
              <Space>
                <span>短信投放转化率</span>
                <Tooltip title="漏斗异常说明：转化率大于1：H5页面在浏览器被访问算一次，存在2种情况会重复计算：链接分享给他人访问、用户换个浏览器访问。转化率为-∞：漏斗下一级数字为0">
                  <QuestionCircleOutlined style={{ fontSize: '14px' }} />
                </Tooltip>
              </Space>
            }
            loading={metricLoading}
            data={data['messageConversion']}
          >
            <FunnelChart data={[]} />
          </DataSource>
        </Col>
      </Row>

      {/* 实时访问数据 */}
      <Suspense fallback={<Spin />}>
        <RealTimeView activityId={currentActivity} />
      </Suspense>
    </PageContainer>
  )
}
