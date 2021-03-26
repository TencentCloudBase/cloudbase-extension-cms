import React from 'react'
import { Skeleton, Spin } from 'antd'
import { MicroApp, history } from 'umi'
import { PageContainer } from '@ant-design/pro-layout'
import ErrorBoundary from '@/components/ErrorBoundary'

/**
 * 挂载微应用
 */
const MicroContainer = () => {
  // TODO 通信
  window.addEventListener('_FROM_CMS_MICRO_APP_SLAVE_', (e: Event) => {
    // console.log('收到信息', e)
  })

  // 从路径中获取微应用 id
  const microAppID = history.location.pathname.replace('/project/microapp/', '').split('/').shift()

  if (!microAppID) {
    return <Skeleton active />
  }

  return (
    <PageContainer>
      <ErrorBoundary
        fallbackRender={() => {
          return <div>微应用渲染异常</div>
        }}
      >
        <MicroApp
          name={microAppID}
          autoSetLoading
          loader={(loading) =>
            loading ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: '600px' }}
              >
                <Spin size="large" />
                <span className="mt-5">应用加载中</span>
              </div>
            ) : (
              ''
            )
          }
        />
      </ErrorBoundary>
    </PageContainer>
  )
}

export default MicroContainer
