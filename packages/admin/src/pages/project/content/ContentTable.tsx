import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react'
import { useConcent } from 'concent'
import { useParams, history } from 'umi'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import {
  Button,
  Modal,
  message,
  Space,
  Row,
  Col,
  Dropdown,
  Menu,
  Upload,
  Progress,
  Alert,
  Typography,
  Select,
} from 'antd'
import { PlusOutlined, DeleteOutlined, FilterOutlined, InboxOutlined } from '@ant-design/icons'
import {
  getContents,
  deleteContent,
  batchDeleteContent,
  createMigrateJobs,
} from '@/services/content'
import { CtxM } from 'typings/store'
import { random, uploadFile } from '@/utils'
import { ContentTableSearch } from './SearchForm'
import { getTableColumns } from './columns'
import './index.less'

// 不能支持搜索的类型
const negativeTypes = ['File', 'Image']
const { Dragger } = Upload
const { Title } = Typography
const { Option } = Select

type Ctx = CtxM<{}, 'content'> // 属于 content 模块的实例上下文类型

/**
 * 内容展示表格
 */
export const ContentTable: React.FC<{
  currentSchema: SchemaV2
}> = (props) => {
  const { currentSchema } = props
  const ctx = useConcent<{}, Ctx>('content')
  const { projectId, schemaId } = useParams<any>()

  // 检索的字段
  const { searchFields, searchParams } = ctx.state

  // table 引用
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
    [searchParams]
  )

  // 搜索字段下拉菜单
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
    const columns = getTableColumns(currentSchema?.fields)

    return [
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
    ]
  }, [currentSchema])

  // 表格多选操作
  const tableAlerRender = useMemo(() => getTableAlertRender(projectId, currentSchema, tableRef), [
    currentSchema,
  ])

  // 表格 ToolBar
  const toolBarRender = useMemo(
    () => [
      <Dropdown overlay={searchFieldMenu} key="search">
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
      <DataImport key="import" collectionName={currentSchema.collectionName} />,
    ],
    [currentSchema]
  )

  return (
    <>
      <ContentTableSearch
        schema={currentSchema}
        onSearch={(params) => {
          ctx.setState({
            searchParams: params,
          })
          tableRef?.current?.reload(true)
        }}
      />
      <ProTable
        rowKey="_id"
        defaultData={[]}
        rowSelection={{}}
        tableAlertRender={tableAlerRender}
        search={false}
        actionRef={tableRef}
        dateFormatter="string"
        scroll={{ x: 1000 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '50'],
        }}
        columns={memoTableColumns}
        request={tableRequest}
        toolBarRender={() => toolBarRender}
      />
    </>
  )
}

/**
 * 导入数据
 */
export const DataImport: React.FC<{ collectionName: string }> = ({ collectionName }) => {
  const { projectId } = useParams<any>()
  const [visible, setVisible] = useState(false)
  const [percent, setPercent] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dataType, setDataType] = useState<string>('')
  const [conflictMode, setConflictMode] = useState('insert')

  useEffect(() => {
    if (!visible) {
      setPercent(0)
    }
  }, [visible])

  return (
    <>
      <Dropdown
        overlay={
          <Menu
            onClick={({ key }) => {
              if (key === 'record') {
                history.push(`/${projectId}/content/migrate`)
                return
              }
              setDataType(key as string)
              setVisible(true)
            }}
          >
            <Menu.Item key="csv">通过 CSV 导入</Menu.Item>
            <Menu.Item key="json">通过 JSON 导入</Menu.Item>
            <Menu.Item key="record">查看导入记录</Menu.Item>
          </Menu>
        }
        key="search"
      >
        <Button type="primary">导入数据</Button>
      </Dropdown>
      <Modal
        destroyOnClose
        width={600}
        title="导入数据"
        footer={null}
        closable={true}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <Title level={4}>注意事项</Title>
        {dataType === 'json' && (
          <Alert
            message="JSON 数据不是数组，而是类似 JSON Lines，即各个记录对象之间使用 \n 分隔，而非逗号"
            style={{ marginBottom: '10px' }}
          />
        )}
        {dataType === 'csv' && (
          <Alert message="CSV 格式的数据默认以第一行作为导入后的所有键名，余下的每一行则是与首行键名一一对应的键值记录" />
        )}
        <br />
        <Title level={4}>冲突处理模式</Title>
        <Select
          defaultValue="insert"
          onChange={setConflictMode}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Option value="insert">Insert（会在导入时总是插入新记录，出现 _id 冲突时会报错）</Option>
          <Option value="upsert">
            Upsert（会判断有无该条记录，如果有则更新记录，否则就插入一条新记录）
          </Option>
        </Select>
        <Dragger
          accept=".csv,.json"
          listType="picture"
          beforeUpload={(file) => {
            setUploading(true)
            setPercent(0)
            // 文件路径
            const filePath = `data-import/${random(32)}-${file.name}`
            // 上传文件
            uploadFile(
              file,
              (percent) => {
                setPercent(percent)
              },
              filePath
            )
              .then(() => createMigrateJobs(projectId, collectionName, filePath, conflictMode))
              .then(() => {
                setVisible(false)
                message.success('上传文件成功，数据导入中')
              })
              .catch((e) => {
                message.error(`导入文件失败：${e.message}`)
                setVisible(false)
              })
            return false
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽上传文件，开始导入数据</p>
        </Dragger>
        {uploading && <Progress style={{ paddingTop: '10px' }} percent={percent} />}
      </Modal>
    </>
  )
}

/**
 * Table 批量操作
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
