import React, { useEffect } from 'react'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { history, useParams } from 'umi'
import { useConcent } from 'concent'
import { ContentCtx, GlobalCtx } from 'typings/store'
import { ContentTable } from '../../content/ContentTable'
import { ActivitySchema } from './schema'

export default (): React.ReactNode => {
  const { projectId } = useParams<any>()
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const contentCtx = useConcent<{}, ContentCtx>('content')
  const { setting } = globalCtx.state

  useEffect(() => {
    contentCtx.setState({
      currentSchema: ActivitySchema,
    })
  }, [])

  if (!setting?.enableOperation) {
    history.push(`/${projectId}/operation`)
    return ''
  }

  return (
    <PageContainer
      title="营销活动"
      content="创建营销活动，将自动生成对应的中间页，可从短信、邮件、微信内H5、微信外部H5调起小程序指定路径，活动下发后可更新配置并实时生效"
    >
      <ProCard>
        <ContentTable currentSchema={ActivitySchema} />
      </ProCard>
    </PageContainer>
  )
}
