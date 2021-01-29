import React from 'react'
import { Space, Spin } from 'antd'
import ProCard from '@ant-design/pro-card'
import { PieChartTwoTone } from '@ant-design/icons'

const cardStyle = {
  height: '500px',
}

/**
 * 获取 metric 对应的数据
 */
const DataSource: React.FC<{ data: any; title: React.ReactNode; loading: boolean }> = ({
  title,
  children,
  data,
  loading,
}) => {
  // 加载中
  if (loading || !data || data === -1) {
    return (
      <ProCard title={title} style={cardStyle}>
        <div className="flex justify-center items-center h-full">
          <Space direction="vertical" align="center" size="large">
            <PieChartTwoTone style={{ fontSize: '48px' }} />
            {loading ? (
              <Spin />
            ) : (
              <p className="text-xl">{data === -1 ? '数据为空' : '加载中...'}</p>
            )}
          </Space>
        </div>
      </ProCard>
    )
  }

  // 数据为空
  const isEmptyData = !data?.filter((_: any) => _?.value || _?.number)?.length
  if (isEmptyData) {
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

  // set data
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { data })
    }
    return child
  })

  return (
    <ProCard title={title} style={cardStyle}>
      {childrenWithProps}
    </ProCard>
  )
}

export default DataSource
