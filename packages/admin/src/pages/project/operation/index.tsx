import React from 'react'
import { Alert, Button, Col, Form, Input, message, Row, Space } from 'antd'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { history, useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { enableOperationService } from '@/services/operation'

export default (): React.ReactNode => {
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state

  if (!setting?.enableOperation) {
    return <ServiceEnable />
  }

  return (
    <PageContainer>
      <ProCard>营销工具</ProCard>
    </PageContainer>
  )
}

/**
 * 开启营销活动
 */
const ServiceEnable: React.FC = () => {
  const { projectId } = useParams<any>()
  const { run, loading } = useRequest(
    async (data) => {
      await enableOperationService(projectId, data)
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('营销工具开通成功')
        setTimeout(() => {
          history.push(`/${projectId}/operation/activity`)
          window.location.reload()
        }, 1000)
      },
      onError: (e) => {
        console.error(e)
        // 创建任务，生成 token 失败
        message.error(`营销工具开通失败 ${e.message}`)
      },
    }
  )

  return (
    <PageContainer
      title="开通营销工具"
      content="营销工具可支持创建活动，并自动生成对应的中间页，可在从短信、邮件、微信 H5、微信外部 H5 调起小程序特定页面，活动下发后可更新配置并实时生效"
    >
      <Row>
        <Col
          md={{ span: 24, offset: 0 }}
          lg={{ span: 20, offset: 2 }}
          xl={{ span: 18, offset: 3 }}
          xxl={{ span: 16, offset: 4 }}
        >
          <ProCard>
            <Alert
              type="warning"
              message="仅支持非个人主体小程序开通，开通后将会在启用当前环境的未登录能力"
            />
            <p />
            <Form
              name="basic"
              layout="vertical"
              onFinish={(v: any) => {
                console.log(v)
                run(v)
              }}
            >
              <Form.Item
                label="小程序名称"
                name="miniappName"
                extra="填入要跳转的小程序名称"
                rules={[
                  {
                    required: true,
                    message: '请填写小程序名称',
                  },
                ]}
              >
                <Input placeholder="小程序名称" />
              </Form.Item>

              <Form.Item
                required
                label="小程序 AppID"
                name="miniappID"
                extra=""
                rules={[
                  {
                    required: true,
                    message: '请填写小程序 AppID',
                  },
                ]}
              >
                <Input placeholder="小程序 AppID" />
              </Form.Item>

              <Form.Item
                label="小程序原始 ID"
                name="miniappOriginalID"
                extra="填入你的小程序原始 ID（gh_ 开头）"
                rules={[
                  {
                    required: true,
                    message: '请填写小程序原始 ID',
                  },
                ]}
              >
                <Input placeholder="gh_xxxxxxxx" />
              </Form.Item>

              <Form.Item>
                <Row>
                  <Col flex="1 1 auto" style={{ textAlign: 'right' }}>
                    <Space size="large">
                      <Button type="primary" htmlType="submit" loading={loading}>
                        开通
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
