import React, { useState, useMemo } from 'react'
import { useRequest } from 'umi'
import { getContents } from '@/services/content'
import { Menu, Modal, Button, Dropdown, Alert, message } from 'antd'
import { exportData, formatSearchParams } from './tool'
import { getProjectId } from '@/utils'

type ExportFileType = 'csv' | 'json'

/**
 * 导出数据
 */
const DataExport: React.FC<{ schema: Schema; collectionName: string; searchParams: any }> = ({
  schema,
  searchParams = {},
  collectionName,
}) => {
  const projectId = getProjectId()
  const searchKeys = Object.keys(searchParams)
  const [visible, setVisible] = useState(false)
  const [fileType, setFileType] = useState<ExportFileType>('json')

  const fuzzyFilter = useMemo(() => formatSearchParams(searchParams, schema), [
    schema,
    searchParams,
  ])

  const { run: getExportData, loading } = useRequest(
    async () => {
      const { data } = await getContents(projectId, collectionName, {
        fuzzyFilter,
        page: 1,
        pageSize: 1000,
      })

      await exportData(data, fileType)
    },
    {
      manual: true,
      onSuccess: () => {
        setVisible(false)
        message.success('导出数据成功')
      },
      onError: (e) => message.error(`导出数据失败：${e.message}`),
    }
  )

  return (
    <>
      <Dropdown
        overlay={
          <Menu
            onClick={({ key }) => {
              setVisible(true)
              setFileType(key as ExportFileType)
            }}
          >
            <Menu.Item key="csv">导出为 CSV 文件</Menu.Item>
            <Menu.Item key="json">导出为 JSON 文件</Menu.Item>
          </Menu>
        }
        key="search"
      >
        <Button type="primary">导出数据</Button>
      </Dropdown>
      <Modal
        centered
        destroyOnClose
        width={600}
        title="导出数据"
        closable={true}
        visible={visible}
        okButtonProps={{ loading }}
        onOk={() => getExportData()}
        okText={loading ? '导出数据中' : '确定'}
        onCancel={() => setVisible(false)}
      >
        {searchKeys?.length ? <span>将导出满足搜索条件的数据</span> : <span>将导出全量数据</span>}
        <Alert type="warning" message="最多支持导出 1000 条数据" className="mt-3" />
      </Modal>
    </>
  )
}

export default DataExport
