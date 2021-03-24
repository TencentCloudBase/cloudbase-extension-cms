import React, { useEffect } from 'react'
import { MicroApp, history } from 'umi'
import { PageContainer } from '@ant-design/pro-layout'
import ErrorBoundary from '@/components/ErrorBoundary'

/**
 * 挂载微应用
 */
const MicroContainer = () => {
  window.addEventListener('_FROM_CMS_MICRO_APP_SLAVE_', (e: Event) => {
    console.log('收到信息', e)
  })

  const appName = history.location.pathname.replace('/project/microapp/', '').split('/').shift()
  console.log(appName)

  return (
    <PageContainer>
      <ErrorBoundary
        fallbackRender={() => {
          return <div>微应用渲染异常</div>
        }}
      >
        <MicroApp name={appName || ''} />
      </ErrorBoundary>
    </PageContainer>
  )
}

export default MicroContainer
