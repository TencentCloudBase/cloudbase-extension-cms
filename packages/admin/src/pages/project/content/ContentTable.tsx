import { useParams, history } from 'umi'
import { useConcent } from 'concent'
import ProTable from '@ant-design/pro-table'
import { Button, Modal, message, Space, Row, Col, Dropdown, Menu } from 'antd'
import React, { useState, useRef, useCallback } from 'react'
import { PlusOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons'
import { getContents, deleteContent, batchDeleteContent } from '@/services/content'
import { getTableColumns } from './columns'
import { ContentTableSearch } from './components'
import './index.less'

// 不能支持搜索的类型
const negativeTypes = ['File', 'Image']

export const ContentTable: React.FC<{
  currentSchema: SchemaV2
}> = (props) => {
  const { currentSchema } = props
  const ctx = useConcent('content')
  const { projectId, schemaId } = useParams()
  const [searchParams, setSearchParams] = useState<any>()
  // 检索的字段
  const [searchFields, setSearchFields] = useState<SchemaFieldV2[]>([])

  // table 引用
  const tableRef = useRef<{
    reload: (resetPageIndex?: boolean) => void
    reloadAndRest: () => void
    fetchMore: () => void
    reset: () => void
    clearSelected: () => void
  }>()

  const columns = getTableColumns(currentSchema?.fields)

  // 表格数据请求
  const tableRequest = useCallback(
    async (
      params: { pageSize: number; current: number; [key: string]: any },
      sort: any,
      filter: any
    ) => {
      const { pageSize, current } = params
      const resource = currentSchema.collectionName

      // 搜索参数
      const fuzzyFilter = searchParams
        ? Object.keys(searchParams)
            .filter((key) =>
              currentSchema.fields?.some((field: SchemaFieldV2) => field.name === key)
            )
            .reduce(
              (prev, key) => ({
                ...prev,
                [key]: searchParams[key],
              }),
              {}
            )
        : {}

      try {
        const { data = [], total } = await getContents(projectId, resource, {
          sort,
          filter,
          pageSize,
          fuzzyFilter,
          page: current,
        })

        return {
          data,
          total,
          success: true,
        }
      } catch (error) {
        console.log('内容请求错误', error)
        return {
          data: [],
          total: 0,
          success: true,
        }
      }
    },
    []
  )

  const fieldMenu = (
    <Menu
      onClick={({ key }) => {
        const field = currentSchema.fields.find((_) => _.name === key)
        field && setSearchFields([...searchFields, field])
      }}
    >
      {currentSchema?.fields
        ?.filter((filed) => !negativeTypes.includes(filed.type))
        .map((field) => (
          <Menu.Item key={field.name}>{field.displayName}</Menu.Item>
        ))}
    </Menu>
  )

  return (
    <>
      <ContentTableSearch
        schema={currentSchema}
        searchFields={searchFields}
        setSearchFields={setSearchFields}
        onSearch={(params) => {
          setSearchParams(params)
          tableRef?.current?.reload(true)
        }}
      />
      <ProTable
        rowKey="_id"
        rowSelection={{}}
        tableAlertRender={getTableAlertRender(projectId, currentSchema, tableRef)}
        search={false}
        actionRef={tableRef}
        dateFormatter="string"
        scroll={{ x: 1000 }}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '50'],
        }}
        columns={[
          ...columns,
          {
            title: '操作',
            width: 150,
            align: 'center',
            fixed: 'right',
            valueType: 'option',
            render: (text, row: any) => [
              <Button
                size="small"
                type="primary"
                key="edit"
                onClick={() => {
                  ctx.setState({
                    contentAction: 'edit',
                    selectedContent: row,
                  })

                  history.push(`/${projectId}/content/${schemaId}/edit`)
                }}
              >
                编辑
              </Button>,
              <Button
                danger
                size="small"
                key="delete"
                type="primary"
                onClick={() => {
                  const modal = Modal.confirm({
                    title: '确认删除此内容？',
                    onCancel: () => {
                      modal.destroy()
                    },
                    onOk: async () => {
                      try {
                        await deleteContent(projectId, currentSchema.collectionName, row._id)
                        tableRef?.current?.reloadAndRest()
                        message.success('删除内容成功')
                      } catch (error) {
                        message.error('删除内容失败')
                      }
                    },
                  })
                }}
              >
                删除
              </Button>,
            ],
          },
        ]}
        request={tableRequest}
        toolBarRender={() => [
          <Dropdown overlay={fieldMenu} key="search">
            <Button type="primary">
              <FilterOutlined /> 增加检索
            </Button>
          </Dropdown>,
          <Button
            key="button"
            type="primary"
            icon={<PlusOutlined />}
            disabled={!currentSchema.fields?.length}
            onClick={() => {
              if (!currentSchema?._id) {
                message.error('请选择需要创建的内容类型！')
                return
              }

              ctx.setState({
                contentAction: 'create',
                selectedContent: null,
              })

              history.push(`/${projectId}/content/${schemaId}/edit`)
            }}
          >
            新建
          </Button>,
        ]}
      />
    </>
  )
}

/**
 * Table 批量操作提醒
 */
const getTableAlertRender = (projectId: string, currentSchema: SchemaV2, tableRef: any) => ({
  intl,
  selectedRowKeys,
  selectedRows,
}: {
  intl: any
  selectedRowKeys: any[]
  selectedRows: any[]
}) => {
  return (
    <Row>
      <Col flex="0 0 auto">
        <Space>
          <span>已选中</span>
          <a style={{ fontWeight: 600 }}>{selectedRowKeys?.length}</a>
          <span>项</span>
        </Space>
      </Col>
      <Col flex="1 1 auto" style={{ textAlign: 'right' }}>
        <Button
          danger
          size="small"
          type="primary"
          onClick={() => {
            const modal = Modal.confirm({
              title: '确认删除选中的内容？',
              onCancel: () => {
                modal.destroy()
              },
              onOk: async () => {
                try {
                  const ids = selectedRows.map((_: any) => _._id)
                  await batchDeleteContent(projectId, currentSchema.collectionName, ids)
                  tableRef?.current?.reloadAndRest()
                  message.success('删除内容成功')
                } catch (error) {
                  message.error('删除内容失败')
                }
              },
            })
          }}
        >
          <DeleteOutlined /> 删除文档
        </Button>
      </Col>
    </Row>
  )
}
