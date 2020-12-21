import { Spin } from 'antd'
import React, { useEffect } from 'react'
import { history, useRequest } from 'umi'
import { getCollectionInfo } from '@/services/common'

export default () => {
  const { collectionName, from, customId } = history.location.query || {}

  // 不存在 projectCustomId
  if (!customId || !from) {
    history.push('/home')
    return ''
  }

  // 获取项目、模型信息
  const { data } = useRequest<{
    data: {
      schema: Schema
      project: Project
    }
  }>(() => getCollectionInfo(customId, collectionName))

  useEffect(() => {
    if (!data) return
    const { schema, project } = data
    // 跳转到对应的集合管理页面
    if (schema?._id) {
      history.push(`/${project._id}/content/${schema._id}`)
    } else if (project) {
      history.push(`/${project._id}/home`)
    } else {
      history.push('/home')
    }
  }, [data])

  return (
    <div className="flex items-center justify-center h-full">
      <Spin size="large" tip="加载中" />
    </div>
  )
}
