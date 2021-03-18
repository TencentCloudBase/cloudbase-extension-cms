import { MicroApp, useParams } from 'umi'
import React, { useEffect } from 'react'
import { PageContainer } from '@ant-design/pro-layout'

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
