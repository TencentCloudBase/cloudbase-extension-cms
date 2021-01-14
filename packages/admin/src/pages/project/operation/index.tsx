import React, { useEffect } from 'react'
import { Alert, Button, Col, Descriptions, Form, Input, message, Row, Skeleton, Space } from 'antd'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { history, SettingState, useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { enableOperationService, getOpenAPIToken } from '@/services/operation'
import { getWxCloudApp } from '@/utils'
import { useSetState, useToggle } from 'react-use'

interface MiniApp {
  miniappID: string
  miniappName: string
  miniappOriginalID: string
}

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
      await enableOperationService(projectId, data)
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
        // 创建任务，生成 token 失败
        message.error(`营销工具开通失败 ${e.message}`)
      },
    }
  )

  // 有 AppID 时使用快速开通
  if (setting?.miniappID) {
    return <OperationEnableByAppID miniappID={setting.miniappID} enableService={enableService} />
  }

  return <AppForm onSubmit={enableService} />
}

/**
 * 有 AppID 的情况下开通服务
 */
const OperationEnableByAppID: React.FC<{
  miniappID: string
  enableService: (app: MiniApp) => Promise<void>
}> = ({ miniappID, enableService }) => {
  const { projectId } = useParams<any>()
  const ctx = useConcent<{}, GlobalCtx>('global')
  const [appInfo, setState] = useSetState<MiniApp>({
    miniappID: '',
    miniappName: '',
    miniappOriginalID: '',
  })

  useEffect(() => {
    // 没有 AppID，无法调用云调用，获取小程序信息
    if (!miniappID) return

    const getAppInfo = async () => {
      const wxCloudApp = await getWxCloudApp({
        miniappID,
      })

      const { token } = await getOpenAPIToken(projectId)

      try {
        // 获取小程序的名称和原始 ID
        const { result } = await wxCloudApp.callFunction({
          name: 'wx-ext-cms-sms',
          data: {
            token,
            action: 'getAppBasicInfo',
          },
        })

        const { appid, nickname, username } = result || {}

        const appInfo: MiniApp = {
          miniappID: appid,
          miniappName: nickname,
          miniappOriginalID: username,
        }

        setState(appInfo)

        await ctx.mr.updateSetting(appInfo)
      } catch (e) {
        console.log('获取小程序信息错误', e)
        message.error(e.message)
      }
    }

    getAppInfo()
  }, [miniappID])

  // 加载信息中
  if (!appInfo?.miniappOriginalID) {
    return <Skeleton active />
  }

  return <AppForm appInfo={appInfo} onSubmit={enableService} />
}

/**
 * 小程序信息表单
 */
const AppForm: React.FC<{ appInfo?: MiniApp; onSubmit: (app: any) => Promise<void> }> = ({
  appInfo,
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
        initialValues={appInfo}
        onFinish={(v: MiniApp) => {
          toggle(true)
          let app = v?.miniappName ? v : appInfo
          onSubmit(app)
            .then(() => {
              toggle(false)
            })
            .catch(() => {
              toggle(false)
            })
        }}
      >
        {appInfo ? (
          <Descriptions title="将会为下面的小程序开通营销工具" column={1}>
            <Descriptions.Item label="小程序名称">{appInfo.miniappName}</Descriptions.Item>
            <Descriptions.Item label="小程序 AppID">{appInfo.miniappID}</Descriptions.Item>
            <Descriptions.Item label="小程序原始 ID">{appInfo.miniappOriginalID}</Descriptions.Item>
          </Descriptions>
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
