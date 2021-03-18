import React from 'react'
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  message,
  notification,
  Row,
  Skeleton,
  Space,
  Steps,
  Typography,
} from 'antd'
import { useToggle } from 'react-use'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { history, useRequest } from 'umi'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { enableNonLogin, enableOperationService } from '@/services/operation'
import { callWxOpenAPI, getProjectId, redirectTo, sleep } from '@/utils'

const { Step } = Steps
const { Link } = Typography

interface MiniApp {
  miniappID: string
  miniappName: string
  miniappOriginalID: string
}

export default (): React.ReactNode => {
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
  redirectTo('operation/activity')

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
const OperationEnable: React.FC<{ setting: GlobalSetting }> = ({ setting }) => {
  const projectId = getProjectId()

  // 开通营销工具
  const { run: enableService } = useRequest(
    async (data: MiniApp) => {
      // 获取小程序信息
      const getAppInfo = async (retry = 1): Promise<any> => {
        try {
          // 获取小程序的名称和原始 ID
          const data = await callWxOpenAPI('getAppBasicInfo')
          const { appid, nickname, username, realnametype } = data || {}
          return {
            realnametype,
            miniappID: appid,
            miniappName: nickname,
            miniappOriginalID: username,
          }
        } catch (error) {
          // 可能出现异常，最大尝试 2 分钟
          if (retry <= 24) {
            await sleep(5000)
            return getAppInfo(retry + 1)
          } else {
            // 抛出错误
            throw error
          }
        }
      }

      // 开启未登录
      await enableNonLogin(projectId)

      // 存储 appId
      if (setting?.miniappID || window.TcbCmsConfig.mpAppID) {
        // 开通未登录
        await sleep(1000)
        // 获取小程序信息
        const appInfo = await getAppInfo()

        if (!appInfo?.miniappID) {
          message.error('获取小程序信息异常，请重试！')
          return
        }

        // 校验是否为个人主题
        if (Number(appInfo.realnametype) === 0) {
          throw new Error('仅支持非个人主体开通营销工具！')
        }

        // 开通营销工具
        await enableOperationService(projectId, appInfo)
      } else {
        await enableOperationService(projectId, data)
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('营销工具开通成功')
        redirectTo('operation/activity')
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
  return (
    <AppForm
      hasAppId={Boolean(setting?.miniappID || window.TcbCmsConfig.mpAppID)}
      onSubmit={enableService}
    />
  )
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
        ) : window.TcbCmsConfig.fromLowCode ? (
          <>
            <h3>营销工具可帮助您从多种渠道推广小程序，请先按照以下步骤完成小程序的绑定。</h3>
            <Steps direction="vertical" className="mt-5">
              <Step
                status="process"
                title="绑定小程序"
                description={
                  <div>
                    登录
                    <Link href="https://console.cloud.tencent.com/developer">腾讯云账号中心，</Link>
                    在面板【登录方式】中，在【微信公众平台】处绑定待开发的小程序。
                  </div>
                }
              />
              <Step
                status="process"
                title="开通云开发"
                description={
                  <div>
                    使用待开发的小程序登录
                    <Link href="https://mp.weixin.qq.com">微信公众平台</Link>
                    ，点击左侧【开发】-【云开发】，立即开通云开发。
                  </div>
                }
              />
            </Steps>
          </>
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

        {window.TcbCmsConfig.fromLowCode && !hasAppId ? (
          ''
        ) : (
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
        )}
      </Form>
    </>
  )
}
