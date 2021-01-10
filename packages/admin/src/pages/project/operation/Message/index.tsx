import { useConcent } from 'concent'
import { useSetState } from 'react-use'
import { history, useParams } from 'umi'
import { ContentCtx, GlobalCtx } from 'typings/store'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import React, { useRef, useCallback, useMemo } from 'react'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { getContents, batchDeleteContent } from '@/services/content'
import { Button, Modal, message, Space, Row, Col, Dropdown, Menu, List, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons'
import { formatSearchParams } from '../../content/common'
import ContentTableSearchForm from '../../content/SearchForm'
import { TaskSchema } from './schema'
import { columns } from './columns'

const { Text } = Typography

export default (): React.ReactNode => {
  const { projectId } = useParams<any>()
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state

  if (!setting?.enableOperation) {
    history.push(`/${projectId}/operation`)
    return ''
  }

  return (
    <PageContainer>
      <ProCard>
        <ContentTable currentSchema={TaskSchema} />
      </ProCard>
    </PageContainer>
  )
}

// 不能支持搜索的类型
const negativeTypes = ['File', 'Image']

/**
 * 内容展示表格
 */
export const ContentTable: React.FC<{
  currentSchema: Schema
}> = (props) => {
  const { currentSchema } = props
  const { projectId } = useParams<any>()
  const [{ visible, sendStatusList }, setState] = useSetState<any>({
    visible: false,
    sendStatusList: [],
  })
  const ctx = useConcent<{}, ContentCtx>('content')

  // 检索的字段
  const { searchFields, searchParams } = ctx.state

  // 表格引用，重置、操作表格
  const tableRef = useRef<{
    reload: (resetPageIndex?: boolean) => void
    reloadAndRest: () => void
    fetchMore: () => void
    reset: () => void
    clearSelected: () => void
  }>()

  // 表格数据请求
  const tableRequest = useCallback(
    async (
      params: { pageSize: number; current: number; [key: string]: any },
      sort: any,
      filter: any
    ) => {
      const { pageSize, current } = params
      const resource = currentSchema.collectionName

      const fuzzyFilter = formatSearchParams(searchParams, currentSchema)

      try {
        const { data = [], total } = await getContents(projectId, resource, {
          sort,
          filter: {
            ...filter,
            projectId,
          },
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
        return {
          data: [],
          total: 0,
          success: true,
        }
      }
    },
    [searchParams]
  )

  /**
   * 搜索字段下拉菜单
   */
  const searchFieldMenu = useMemo(
    () => (
      <Menu
        onClick={({ key }) => {
          const field = currentSchema.fields.find((_) => _.name === key)
          const fieldExist = searchFields?.find((_) => _.name === key)
          if (fieldExist) {
            message.error('字段已添加，请勿重复添加')
            return
          }
          // 添加字段
          field && ctx.mr.addSearchField(field)
        }}
      >
        {currentSchema?.fields
          ?.filter((filed) => !negativeTypes.includes(filed.type))
          .map((field) => (
            <Menu.Item key={field.name}>{field.displayName}</Menu.Item>
          ))}
      </Menu>
    ),
    [currentSchema, searchFields]
  )

  // 缓存 Table Columns 配置
  const memoTableColumns: ProColumns[] = useMemo(() => {
    return [
      ...columns,
      {
        title: '操作',
        width: 150,
        align: 'center',
        fixed: 'right',
        valueType: 'option',
        render: (text, record: any) => [
          <Button
            size="small"
            type="primary"
            key="edit"
            onClick={() => {
              setState({
                visible: true,
                sendStatusList: record?.sendStatusList || [],
              })
            }}
          >
            发送结果
          </Button>,
        ],
      },
    ]
  }, [currentSchema])

  // 表格多选操作
  const tableAlerRender = useMemo(() => getTableAlertRender(projectId, currentSchema, tableRef), [
    currentSchema,
  ])

  // 表格 ToolBar
  const toolBarRender = useMemo(
    () => [
      // TODO: 暂时隐藏检索按钮
      // <Dropdown overlay={searchFieldMenu} key="search">
      //   <Button type="primary">
      //     <FilterOutlined /> 增加检索
      //   </Button>
      // </Dropdown>,
      <Button
        key="button"
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          history.push(`/${projectId}/operation/message/create`)
        }}
      >
        新建群发
      </Button>,
    ],
    [currentSchema, searchParams, searchFields]
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
    <>
      {/* 搜索表单 */}
      <ContentTableSearchForm
        schema={currentSchema}
        onSearch={(params) => {
          ctx.setState({
            searchParams: params,
          })
          setPageQuery(1, 10)
          tableRef?.current?.reload(true)
        }}
      />

      {/* 数据 Table */}
      <ProTable
        rowKey="_id"
        search={false}
        rowSelection={{}}
        actionRef={tableRef}
        dateFormatter="string"
        scroll={{ x: 1000 }}
        request={tableRequest}
        columns={memoTableColumns}
        toolBarRender={() => toolBarRender}
        tableAlertRender={tableAlerRender}
        pagination={{
          ...pagination,
          // 翻页时，将分页数据保存在 URL 中
          onChange: (current = 1, pageSize = 10) => {
            setPageQuery(current, pageSize)
          },
        }}
      />

      <Modal
        width={720}
        title="短信发送结果"
        visible={visible}
        onCancel={() => setState({ visible: false })}
      >
        <List
          dataSource={sendStatusList}
          renderItem={(item: any, i) => (
            <List.Item key={i}>
              <List.Item.Meta title={item.phoneNumber} />
              <Text type={item.code !== 'Ok' ? 'danger' : 'success'}>{item.message}</Text>
            </List.Item>
          )}
        >
          {!sendStatusList?.length && '空'}
        </List>
      </Modal>
    </>
  )
}

/**
 * Table 批量操作
 */
const getTableAlertRender = (projectId: string, currentSchema: Schema, tableRef: any) => ({
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
        <Space>
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
                    tableRef?.current?.reload()
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
        </Space>
      </Col>
    </Row>
  )
}

/**
 * 修改、添加 URL 中的 pageSize 和 current 参数
 */
const setPageQuery = (current = 1, pageSize = 10) => {
  const { pathname, query } = history.location
  history.replace({
    path: pathname,
    query: {
      ...query,
      pageSize,
      current,
    },
  })
}
