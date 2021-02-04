import { stringify } from 'querystring'
import { history, useParams } from 'umi'
import { PageContainer } from '@ant-design/pro-layout'
import React, { useRef, useCallback, useMemo } from 'react'
import ProTable, { ActionType } from '@ant-design/pro-table'
import { getSmsTaskResult } from '@/services/operation'
import { taskResultColumns } from './columns'
import ProCard from '@ant-design/pro-card'

export default (): React.ReactNode => {
  // 短信发送任务查询 ID
  const { projectId, queryId } = useParams<any>()

  // 表格引用，重置、操作表格
  const tableRef = useRef<ActionType>()

  // 表格数据请求
  const tableRequest = useCallback(
    async (
      params: { pageSize: number; current: number; [key: string]: any },
      sort: any,
      filter: any
    ) => {
      const { pageSize, current } = params

      try {
        const { data = [], total } = await getSmsTaskResult(projectId, {
          queryId,
          pageSize,
          page: current,
        })

        return {
          data,
          total,
          success: true,
        }
      } catch (error) {
        return {
          data: [],
          total: 0,
          success: true,
        }
      }
    },
    []
  )

  // 从 url 获取分页条件
  const pagination = useMemo(() => {
    const { query } = history.location
    return {
      showSizeChanger: true,
      defaultCurrent: Number(query?.current) || 1,
      defaultPageSize: Number(query?.pageSize) || 10,
      pageSizeOptions: ['10', '20', '30', '50'],
    }
  }, [])

  return (
    <PageContainer title="短信发送结果">
      <ProCard>
        {/* 数据 Table */}
        <ProTable
          rowKey="_id"
          search={false}
          actionRef={tableRef}
          dateFormatter="string"
          scroll={{ x: 'max-content' }}
          request={tableRequest}
          columns={taskResultColumns}
          pagination={{
            ...pagination,
            // 翻页时，将分页数据保存在 URL 中
            onChange: (current = 1, pageSize = 10) => {
              setPageQuery(current, pageSize)
            },
          }}
        />
      </ProCard>
    </PageContainer>
  )
}

/**
 * 修改、添加 URL 中的 pageSize 和 current 参数
 */
const setPageQuery = (current = 1, pageSize = 10) => {
  const { pathname, query } = history.location

  history.replace({
    pathname,
    search: stringify({
      ...query,
      pageSize,
      current,
    }),
  })
}
