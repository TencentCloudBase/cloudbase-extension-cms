import React from 'react'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { getWebhookLog } from '@/services/webhook'
import { getProjectId } from '@/utils'
import { WebhookLogColumns } from './columns'

const columns: ProColumns<any>[] = WebhookLogColumns.map((item) => ({
  ...item,
  align: 'center',
}))

export default () => {
  const projectId = getProjectId()

  // 获取 webhooks
  const tableRequest = async (
    params: { pageSize: number; current: number; [key: string]: any },
    sort: {
      [key: string]: 'ascend' | 'descend' | null
    },
    filter: {
      [key: string]: React.ReactText[]
    }
  ) => {
    const { current, pageSize } = params

    try {
      const { data = [], total } = await getWebhookLog(projectId, {
        sort: {
          timestamp: 'descend',
        },
        filter,
        pageSize,
        page: current,
      })

      return {
        data,
        total,
        success: true,
      }
    } catch (error) {
      console.log(error)
      return {
        data: [],
        total: 0,
        success: true,
      }
    }
  }

  return (
    <ProTable
      rowKey="_id"
      search={false}
      defaultData={[]}
      columns={columns}
      dateFormatter="string"
      scroll={{ x: 'max-content' }}
      request={tableRequest}
      pagination={{
        showSizeChanger: true,
      }}
    />
  )
}
