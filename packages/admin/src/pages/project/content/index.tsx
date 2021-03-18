import { Empty, Button, Skeleton } from 'antd'
import { useAccess, useParams } from 'umi'
import { useConcent } from 'concent'
import { ContentCtx } from 'typings/store'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import React, { ReactNode, useEffect, useState } from 'react'
import { getProjectId, redirectTo } from '@/utils'
import { ContentTable } from './ContentTable'

export default (): React.ReactNode => {
  const projectId = getProjectId()
  const { schemaId } = useParams<UrlParams>()
  const ctx = useConcent<{}, ContentCtx>('content')
  const [contentLoading, setContentLoading] = useState(false)

  const {
    state: { schemas },
  } = ctx

  const currentSchema = schemas?.find((item: Schema) => item._id === schemaId)

  // HACK: 切换模型时卸载 Table，强制重新加载数据
  // 直接 Reset 表格并加载数据，会保留上一个模型的列，效果不好
  useEffect(() => {
    // 重新挂载 Table
    setContentLoading(true)
    setTimeout(() => {
      setContentLoading(false)
    }, 200)

    // 显示保存的检索条件
    if (currentSchema?.searchFields?.length) {
      ctx.mr.setSearchFields(currentSchema?.searchFields)
    }
  }, [currentSchema])

  return (
    <PageContainer
      content={
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
            <EmptyTip
              btnText="添加字段"
              projectId={projectId}
              desc="当前内容模型字段为空，请添加字段后再创建内容"
            />
          )
        ) : (
          <div className="flex justify-center">
            <EmptyTip
              btnText="创建模型"
              projectId={projectId}
              desc={
                <>
                  <span>内容模型为空 🤔</span>
                  <br />
                  <span>请先创建你的内容模型，再创建内容文档</span>
                </>
              }
            />
          </div>
        )}
      </ProCard>
    </PageContainer>
  )
}

/**
 * 模型为空时的提示信息
 */
const EmptyTip: React.FC<{ projectId: string; desc: ReactNode; btnText: string }> = ({
  desc,
  btnText,
  projectId,
}) => {
  const { canSchema } = useAccess()

  return (
    <Empty description={desc}>
      {canSchema && (
        <Button
          type="primary"
          onClick={() => {
            redirectTo('schema')
          }}
        >
          {btnText}
        </Button>
      )}
    </Empty>
  )
}
