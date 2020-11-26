import { Spin } from 'antd'
import React, { useEffect } from 'react'
import { history, useRequest } from 'umi'
import { getCollectionInfo } from '@/services/common'

export default () => {
  const { collectionName, from } = history.location.query || {}

  // 不存在 projectCustomId
  if (!collectionName || !from) {
    return history.push('/home')
  }

  // 获取项目信息
  const { data: schema } = useRequest<{ data: Schema }>(() => getCollectionInfo(collectionName))

  useEffect(() => {
    // 跳转到对应的集合管理页面
    if (schema?._id) {
      history.push(`/${schema.projectId}/content/${schema._id}`)
    }
  }, [schema])

  return (
    <div className="flex items-center justify-center h-full">
      <Spin size="large" tip="加载中" />
    </div>
  )
}
