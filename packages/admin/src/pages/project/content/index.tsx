import { Empty, Button, Skeleton } from 'antd'
import { history, useParams } from 'umi'
import { useConcent } from 'concent'
import { ContentCtx } from 'typings/store'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import React, { useEffect, useState } from 'react'
import { ContentTable } from './ContentTable'

export default (): React.ReactNode => {
  const { schemaId, projectId } = useParams<any>()
  const ctx = useConcent<{}, ContentCtx>('content')
  const [contentLoading, setContentLoading] = useState(false)

  const {
    state: { schemas },
  } = ctx

  const currentSchema = schemas?.find((item: SchemaV2) => item._id === schemaId)

  // HACK: 切换模型时卸载 Table，强制重新加载数据
  // 直接 Reset 表格并加载数据，会保留上一个模型的列，效果不好
  useEffect(() => {
    setContentLoading(true)
    setTimeout(() => {
      setContentLoading(false)
    }, 200)
  }, [currentSchema])

  return (
    <PageContainer
      content={
        // 渲染内容描述
        <div
          dangerouslySetInnerHTML={{
            __html: currentSchema?.description || '',
          }}
        />
      }
    >
      <ProCard style={{ marginBottom: 0 }}>
        {currentSchema ? (
          contentLoading ? (
            <Skeleton active />
          ) : currentSchema?.fields?.length ? (
            <ContentTable currentSchema={currentSchema} />
          ) : (
            <Empty description="当前内容模型字段为空，请添加字段后再创建内容">
              <Button
                type="primary"
                onClick={() => {
                  history.push(`/${projectId}/schema`)
                }}
              >
                添加字段
              </Button>
            </Empty>
          )
        ) : (
          <div className="flex justify-center">
            <Empty
              description={
                <>
                  <span>内容模型为空 🤔</span>
                  <br />
                  <span>请先创建你的内容模型，再创建内容文档</span>
                </>
              }
            >
              <Button
                type="primary"
                onClick={() => {
                  history.push(`/${projectId}/schema`)
                }}
              >
                创建模型
              </Button>
            </Empty>
          </div>
        )}
      </ProCard>
    </PageContainer>
  )
}
