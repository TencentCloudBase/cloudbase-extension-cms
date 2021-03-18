import React, { useRef } from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { getMigrateJobs } from '@/services/content'
import { getProjectId } from '@/utils'

const StatusMap = {
  waiting: '等待中',
  reading: '读',
  writing: '写',
  migrating: '转移中',
  success: '成功',
  fail: '失败',
}

interface MigrateJobDto {
  // 项目 Id
  projectId: string

  // 任务 Id
  jobId: number

  // 导入文件路径
  filePath: string

  // 导入冲突处理模式
  conflictMode: 'upsert' | 'insert'

  createTime: number

  collectionName: string

  // 任务状态
  // waiting：等待中，reading：读，writing：写，migrating：转移中，success：成功，fail：失败
  status: string
}

const MigrateJobColumns: ProColumns<MigrateJobDto>[] = [
  {
    title: 'JobId',
    dataIndex: 'jobId',
  },
  {
    title: '处理冲突模式',
    dataIndex: 'conflictMode',
  },
  {
    title: '数据集合',
    dataIndex: 'collectionName',
  },
  {
    width: '200px',
    title: '创建时间',
    dataIndex: 'createTime',
    valueType: 'dateTime',
  },
  {
    title: '状态',
    dataIndex: 'collections',
    render: (_, row) => StatusMap[row.status],
  },
]

const columns: ProColumns<MigrateJobDto>[] = MigrateJobColumns.map((item) => ({
  ...item,
  align: 'center',
}))

export default (): React.ReactNode => {
  const projectId = getProjectId()

  const tableRef = useRef<ActionType>()

  // 获取 jobs
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
      const { data = [], total } = await getMigrateJobs(projectId, current, pageSize)

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
    <PageContainer title="数据迁移" className="page-container">
      <ProTable
        rowKey="_id"
        search={false}
        defaultData={[]}
        actionRef={tableRef}
        dateFormatter="string"
        scroll={{ x: 'max-content' }}
        request={tableRequest}
        pagination={{
          showSizeChanger: true,
        }}
        columns={columns}
      />
    </PageContainer>
  )
}
