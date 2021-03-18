import React, { useEffect } from 'react'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { useConcent } from 'concent'
import { redirectTo } from '@/utils'
import { ContentCtx, GlobalCtx } from 'typings/store'
import { ActivityTable } from './ActivityTable'
import { ActivitySchema } from './schema'

export default (): React.ReactNode => {
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const contentCtx = useConcent<{}, ContentCtx>('content')
  const { setting } = globalCtx.state

  useEffect(() => {
    contentCtx.setState({
      currentSchema: ActivitySchema,
    })
  }, [])

  if (!setting?.enableOperation) {
    redirectTo('operation')
    return ''
  }

  return (
    <PageContainer
      title="营销活动"
      content="创建营销活动，将自动生成对应的中间页，可从短信、邮件、微信内H5、微信外部H5调起小程序指定路径，活动下发后可更新配置并实时生效"
    >
      <ProCard>
        <ActivityTable currentSchema={ActivitySchema} />
      </ProCard>
    </PageContainer>
  )
}
