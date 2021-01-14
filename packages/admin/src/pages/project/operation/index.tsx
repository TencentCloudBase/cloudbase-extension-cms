import React from 'react'
import { Alert, Button, Col, Form, Input, message, notification, Row, Skeleton, Space } from 'antd'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { history, SettingState, useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { enableNonLogin, enableOperationService, getOpenAPIToken } from '@/services/operation'
import { getWxCloudApp, sleep } from '@/utils'
import { useToggle } from 'react-use'

interface MiniApp {
  miniappID: string
  miniappName: string
  miniappOriginalID: string
}

/**
 *
 */
export default (): React.ReactNode => {
  const { projectId } = useParams<any>()
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state

  // setting 还没有获取到
  if (!setting) {
    return (
      <OperationPageContainer>
        <Skeleton active />
      </OperationPageContainer>
    )
  }

  if (!setting?.enableOperation || !setting?.miniappID) {
    return (
      <OperationPageContainer>
        <OperationEnable setting={setting} />
      </OperationPageContainer>
    )
  }

  // 重定向到活动页面
  history.push(`/${projectId}/operation/activity`)

  return (
    <PageContainer>
      <ProCard>营销工具</ProCard>
    </PageContainer>
  )
}

/**
 * 页面容器
 */
const OperationPageContainer: React.FC = ({ children }) => (
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
        <ProCard>{children}</ProCard>
      </Col>
    </Row>
  </PageContainer>
)

/**
 * 开通营销工具
 */
const OperationEnable: React.FC<{ setting: SettingState }> = ({ setting }) => {
  const { projectId } = useParams<any>()

  // 开通营销工具
  const { run: enableService } = useRequest(
    async (data: MiniApp) => {
      // 获取小程序信息
      const getAppInfo = async () => {
        const wxCloudApp = await getWxCloudApp({
          miniappID: setting.miniappID,
        })

        const { token } = await getOpenAPIToken(projectId)
        // 获取小程序的名称和原始 ID
        const { result } = await wxCloudApp.callFunction({
          name: 'wx-ext-cms-sms',
          data: {
            token,
            action: 'getAppBasicInfo',
          },
        })

        const { appid, nickname, username } = result || {}

        return {
          miniappID: appid,
          miniappName: nickname,
          miniappOriginalID: username,
        }
      }

      // 开启未登录
      await enableNonLogin(projectId)

      // 存储 appId
      if (setting?.miniappID) {
        // 开通未登录
        await sleep(1000)
        // 获取小程序信息
        const appInfo = await getAppInfo()
        await enableOperationService(projectId, appInfo)
      } else {
        await enableOperationService(projectId, data)
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('营销工具开通成功')
        history.push(`/${projectId}/operation/activity`)
        setTimeout(() => {
          window.location.reload()
        }, 200)
      },
      onError: (e) => {
        console.error(e)
        // 开通失败
        notification.error({
          message: '营销工具开通失败',
          description: e.message,
        })
      },
    }
  )

  // 有 AppID 时使用快速开通
  if (setting?.miniappID) {
    return <AppForm hasAppId={true} onSubmit={enableService} />
  }

  return <AppForm onSubmit={enableService} />
}

/**
 * 小程序信息表单
 */
const AppForm: React.FC<{ hasAppId?: boolean; onSubmit: (app: any) => Promise<void> }> = ({
  hasAppId,
  onSubmit,
}) => {
  const [loading, toggle] = useToggle(false)

  return (
    <>
      <Alert
        type="warning"
        message="仅支持非个人主体小程序开通，开通后将会启用当前环境的未登录能力"
      />
      <p />

      <Form
        name="basic"
        layout="vertical"
        onFinish={(v: MiniApp) => {
          toggle(true)
          onSubmit(v)
            .then(() => {
              toggle(false)
            })
            .catch(() => {
              toggle(false)
            })
        }}
      >
        {hasAppId ? (
          <h3>确认开通营销工具？</h3>
        ) : (
          <>
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
          </>
        )}

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
    </>
  )
}
