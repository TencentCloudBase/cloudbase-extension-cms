import { useConcent } from 'concent'
import { stringify } from 'querystring'
import { useSetState } from 'react-use'
import { history } from 'umi'
import { ContentCtx, GlobalCtx } from 'typings/store'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import React, { useRef, useCallback, useMemo } from 'react'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { getContents } from '@/services/content'
import { getProjectId, redirectTo } from '@/utils'
import { Button, Modal, message, Space, Menu, List, Typography, Popover } from 'antd'
import { PlusOutlined, QuestionCircleTwoTone } from '@ant-design/icons'
import { formatSearchParams } from '../../content/tool'
import ContentTableSearchForm from '../../content/SearchForm'
import { TaskSchema } from './schema'
import { taskColumns } from './columns'

const { Text } = Typography

export default (): React.ReactNode => {
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state

  if (!setting?.enableOperation) {
    redirectTo('operation')
    return ''
  }

  return (
    <PageContainer content="短信下发后，会默认附带当前账号所属小程序名称及跳转链接，支持用户直接点击访问你的小程序">
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
  const projectId = getProjectId()
  const [{ visible, sendStatusList }, setState] = useSetState<any>({
    visible: false,
    sendStatusList: [],
  })
  const ctx = useConcent<{}, ContentCtx>('content')

  // 检索的字段
  const { searchFields, searchParams } = ctx.state

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
      const resource = currentSchema.collectionName

      const fuzzyFilter = formatSearchParams(searchParams, currentSchema)

      try {
        const { data = [], total } = await getContents(projectId, resource, {
          sort: {
            ...sort,
            createTime: 1,
          },
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
      ...taskColumns,
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
              // 存在 queryId，则使用结果展示表格
              if (record.queryId) {
                redirectTo('operation/message/result', {
                  query: {
                    queryId: record.queryId,
                  },
                })
              } else {
                setState({
                  visible: true,
                  sendStatusList: record?.sendStatusList || [],
                })
              }
            }}
          >
            发送结果
          </Button>,
        ],
      },
    ]
  }, [currentSchema])

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
          redirectTo('operation/message/create')
        }}
      >
        发送短信
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
        actionRef={tableRef}
        dateFormatter="string"
        scroll={{ x: 'max-content' }}
        request={tableRequest}
        columns={memoTableColumns}
        toolBarRender={() => toolBarRender}
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
        title={
          <>
            <Text>短信发送结果</Text>
            <div style={{ fontSize: '14px', marginTop: '10px' }}>
              <Space>
                <Text>发送成功未收到短信</Text>
                <Popover
                  placement="bottom"
                  content={
                    <div style={{ maxWidth: '600px' }}>
                      <p>有以下场景会导致未收到短信 无效号码</p>
                      <ul className="p-0">
                        <li>1. 空号、关机、停机等运营商标识为非正常使用的号码</li>
                        <li>
                          2.
                          由于用户终端原因造成的无法正常接收短信，包含但不限于欠费、关机、不在服务区、未订购短信服务、终端网络信号、手机拦截等不稳定等状态
                        </li>
                        <li>
                          3. 腾讯云、运营商定义的黑名单号码。 触发限频
                          <ul className="pl-5">
                            <li>a. 相同内容短信对同一个手机号，30 秒内发送短信条数不超过1条</li>
                            <li>b. 对同一个手机号，1 自然日内发送短信条数不超过10条</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  }
                >
                  <QuestionCircleTwoTone />
                </Popover>
              </Space>
            </div>
          </>
        }
        visible={visible}
        onCancel={() => setState({ visible: false })}
        footer={null}
      >
        <div style={{ maxHeight: '450px', overflow: 'auto', paddingRight: '20px' }}>
          <List
            dataSource={sendStatusList}
            renderItem={(item: any, i) => (
              <List.Item key={i}>
                <List.Item.Meta title={item.phoneNumber} />
                <Text
                  style={{ maxWidth: '450px' }}
                  type={item.code !== 'Ok' ? 'danger' : 'success'}
                >
                  {item.message}
                </Text>
              </List.Item>
            )}
          >
            {!sendStatusList?.length && '空'}
          </List>
        </div>
      </Modal>
    </>
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
