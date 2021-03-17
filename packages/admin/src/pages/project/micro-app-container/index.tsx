import { MicroApp, useParams } from 'umi'
import React, { useEffect } from 'react'
import { loadMicroApp, start } from 'qiankun'
import { PageContainer } from '@ant-design/pro-layout'

async function loadApp() {
  try {
    // registerMicroApps([
    //   {
    //     name: 'micro-app',
    //     entry: 'http://localhost:3002/',
    //     container: '#micro-app',
    //     // hash 路由
    //     activeRule: '/#/:projectId/app',
    //   },
    // ])

    loadMicroApp({
      name: 'micro-app',
      entry: 'http://localhost:3002/',
      container: '#micro-app',
    })

    start()
  } catch (error) {
    console.log(error)
  }
}

/**
 * 挂载微应用
 */
const MicroContainer = () => {
  window.addEventListener('_FROM_CMS_MICRO_APP_SLAVE_', (e: Event) => {
    console.log('收到信息', e)
  })

  return (
    <PageContainer>
      Containers
      <MicroApp name="microApp" />
    </PageContainer>
  )
}

export default MicroContainer
