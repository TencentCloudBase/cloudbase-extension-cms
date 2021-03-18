import { useSetState } from 'react-use'
import { useConcent } from 'concent'
import { useRequest, history } from 'umi'
import React, { MutableRefObject, useEffect, useRef } from 'react'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { Form, message, Space, Button, Row, Col, Typography, Modal, Image, Select } from 'antd'
import { LeftCircleTwoTone } from '@ant-design/icons'

import { generateQRCode, getDocInitialValues, getProjectId } from '@/utils'
import { getFieldFormItem } from '@/components/Fields'
import { getLowCodeAppInfo } from '@/services/operation'
import { createContent, updateContent } from '@/services/content'
import { ActivitySchema } from './schema'

const { Paragraph } = Typography

const MessageTask: React.FC = () => {
  // 是否为低码创建的 CMS
  const isFromLowCode = window.TcbCmsConfig.fromLowCode
  const modalRef = useRef<any>(null)
  const [form] = Form.useForm()
  const projectId = getProjectId()
  const ctx = useConcent('content')

  const { selectedContent, contentAction } = ctx.state

  // 表单初始值
  const initialValues = getDocInitialValues(contentAction, ActivitySchema, selectedContent)
  if (isFromLowCode) {
    initialValues.jumpPageType =
      initialValues.jumpPageType || contentAction === 'create' ? 'lowcode' : 'image'
  }

  const [{ pageUrl }, setState] = useSetState<any>({
    pageUrl: '',
  })

  // 创建/更新内容
  const { run, loading } = useRequest(
    async (payload: any) => {
      // 设置低码标识
      if (isFromLowCode) {
        payload.fromLowCode = true
      }

      if (contentAction === 'create') {
        await createContent(projectId, ActivitySchema?.collectionName, payload)
      }

      if (contentAction === 'edit') {
        await updateContent(projectId, ActivitySchema?.collectionName, selectedContent._id, payload)
      }
    },
    {
      manual: true,
      onError: () => {
        message.error(`${contentAction === 'create' ? '新建' : '更新'}内容失败`)
      },
      onSuccess: () => {
        message.success(`${contentAction === 'create' ? '新建' : '更新'}内容成功`)
        // 返回
        history.goBack()
      },
    }
  )

  // 获取低码页面数据
  const { data: lowCodeApp = {} } = useRequest(async () => {
    if (!isFromLowCode) return
    return getLowCodeAppInfo(projectId)
  })

  return (
    <PageContainer title={`${contentAction === 'create' ? '创建' : '更新'}活动`}>
      <Row>
        <Col
          md={{ span: 24, offset: 0 }}
          lg={{ span: 20, offset: 2 }}
          xl={{ span: 18, offset: 3 }}
          xxl={{ span: 16, offset: 4 }}
        >
          <div style={{ cursor: 'pointer' }} onClick={() => history.goBack()}>
            <Space align="center" style={{ marginBottom: '10px' }}>
              <LeftCircleTwoTone style={{ fontSize: '20px' }} />
              <h3 style={{ marginBottom: '0.25rem' }}>返回</h3>
            </Space>
          </div>
          <ProCard>
            <Form
              form={form}
              name="basic"
              layout="vertical"
              onFinish={(v) => run(v)}
              initialValues={initialValues}
            >
              {/* 基本信息 */}
              {ActivitySchema?.fields
                .slice(0, 4)
                .map((filed: SchemaField, index: number) => getFieldFormItem(filed, index))}

              {/* 低码配置 */}
              {isFromLowCode && (
                <Form.Item
                  shouldUpdate
                  name="jumpPageType"
                  label="跳转中间页"
                  rules={[
                    {
                      required: true,
                      message: '请选择跳转中间页类型',
                    },
                  ]}
                >
                  <Select>
                    <Select.Option value="lowcode">高级自定义 H5 页面（由低码开发）</Select.Option>
                    <Select.Option value="image">图片跳转</Select.Option>
                  </Select>
                </Form.Item>
              )}

              {/* 其他配置 */}
              <Form.Item shouldUpdate>
                {() => {
                  if (isFromLowCode && form.getFieldValue('jumpPageType') === 'lowcode') {
                    return (
                      <>
                        <Form.Item label="高级跳转中间页" style={{ marginBottom: 0 }}>
                          <Space align="start" size="large">
                            <Form.Item
                              name="lowcodePage"
                              style={{ minWidth: '30vw' }}
                              extra="选择低码 H5 页面"
                              rules={[
                                {
                                  required: true,
                                  message: '请选择低码 H5 页面',
                                },
                              ]}
                            >
                              <Select>
                                {lowCodeApp?.pages?.map((page: any, index: any) => (
                                  <Select.Option key={index} value={page.url}>
                                    {lowCodeApp.projectName} - {page.name}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                            <Form.Item shouldUpdate>
                              {() => {
                                const lowcodePage = form.getFieldValue('lowcodePage')
                                if (!lowcodePage) return ''
                                return (
                                  <Button
                                    type="primary"
                                    onClick={() => {
                                      setState({
                                        pageUrl: lowcodePage,
                                      })
                                      modalRef.current?.show()
                                    }}
                                  >
                                    预览
                                  </Button>
                                )
                              }}
                            </Form.Item>
                          </Space>
                        </Form.Item>
                        {ActivitySchema?.fields
                          .slice(6)
                          .map((filed: SchemaField, index: number) =>
                            getFieldFormItem(filed, index)
                          )}
                      </>
                    )
                  } else {
                    return ActivitySchema?.fields
                      .slice(4)
                      .map((filed: SchemaField, index: number) => getFieldFormItem(filed, index))
                  }
                }}
              </Form.Item>

              <Form.Item>
                <Row>
                  <Col flex="1 1 auto" style={{ textAlign: 'right' }}>
                    <Space size="large">
                      <Button
                        onClick={() => {
                          history.goBack()
                        }}
                      >
                        取消
                      </Button>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        {contentAction === 'create' ? '创建' : '更新'}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </ProCard>
        </Col>
      </Row>
      <PagePreviewModal actionRef={modalRef} pageUrl={pageUrl} />
    </PageContainer>
  )
}

/**
 * 跳转页面预览
 */
const PagePreviewModal: React.FC<{
  pageUrl: string
  actionRef: MutableRefObject<{
    show: () => void
  }>
}> = ({ actionRef, pageUrl }) => {
  const [{ visible, dataUri }, setState] = useSetState({
    dataUri: '',
    visible: false,
  })

  // 弹窗控制
  const show = () => setState({ visible: true })
  const hide = () => setState({ visible: false })

  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.show = show
    } else {
      actionRef.current = {
        show,
      }
    }
  }, [])

  // 生成二维码
  useEffect(() => {
    if (pageUrl) {
      generateQRCode(pageUrl).then((dataUri) => {
        setState({
          dataUri,
        })
      })
    }

    return () => {}
  }, [pageUrl])

  return (
    <Modal
      centered
      title="跳转页面体验二维码"
      footer={null}
      visible={visible}
      onCancel={() =>
        setState({
          visible: false,
        })
      }
    >
      <Space size="large">
        <Image src={dataUri} height={200} />
        <div>
          <p>体验地址</p>
          <Paragraph copyable style={{ maxWidth: '280px' }} ellipsis={{ rows: 4, symbol: '展开' }}>
            {pageUrl}
          </Paragraph>
        </div>
      </Space>
    </Modal>
  )
}

export default MessageTask
