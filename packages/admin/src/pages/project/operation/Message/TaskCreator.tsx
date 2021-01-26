import React, { useRef } from 'react'
import { useParams, useRequest, history, useModel } from 'umi'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { LeftCircleTwoTone } from '@ant-design/icons'
import QrCode from '@/components/QrCode'
import {
  Form,
  message,
  Space,
  Button,
  Row,
  Col,
  Modal,
  Input,
  notification,
  Typography,
} from 'antd'
import { useSetState } from 'react-use'
import { callWxOpenAPI } from '@/utils'
import { createBatchTask } from '@/services/operation'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { IConnectEditor } from './Connect'
import { ActivityField } from './columns'

const { Text } = Typography
const { TextArea } = Input

interface Task {
  content: string
  activityId: string
  phoneNumbers: string
}

const MessageTask: React.FC = () => {
  const qrCodeRef = useRef<any>()
  const [form] = Form.useForm()
  const { projectId } = useParams<any>()
  const { initialState } = useModel('@@initialState')
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state || {}

  const [{ visible, task, msgLongWarning, activityId }, setState] = useSetState<any>({
    task: {},
    totalNumber: 0,
    visible: false,
    activityId: '',
    msgLongWarning: false,
  })

  if (!setting?.enableOperation) {
    history.push(`/${projectId}/operation`)
    return <span />
  }

  // 创建发送任务
  const { run, loading } = useRequest(
    async (payload: any) => {
      const { currentUser } = initialState || {}

      // 记录创建用户信息
      const { taskId } = await createBatchTask(projectId, {
        ...payload,
        createdUser: currentUser,
      })

      try {
        const result = await callWxOpenAPI('sendSms', {
          taskId,
        })

        console.log(result)

        // 失败
        if (result.code) {
          message.error(`下发短信失败: ${result.message}`)
          notification.error({
            message: result.code,
            description: `${result.code}: ${result.message}`,
          })
        } else {
          message.success('下发短信成功')
          // 返回
          history.goBack()
        }
      } catch (e) {
        console.log(e)
        message.error(`下发短信失败`)
        notification.error({
          message: '下发短信失败',
          description: e.message,
        })
      } finally {
        setState({ visible: false })
      }
    },
    {
      manual: true,
      onError: (e) => {
        console.error(e)
        // 创建任务，生成 token 失败
        message.error(`创建任务失败 ${e.message}`)
      },
    }
  )

  return (
    <PageContainer title="创建【发送短信】任务">
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
              onFinish={(
                v: Task = {
                  content: '',
                  activityId: '',
                  phoneNumbers: '',
                }
              ) => {
                // 任务信息
                const { phoneNumbers, content, activityId } = v

                if (phoneNumbers.includes('\n') && phoneNumbers.includes(',')) {
                  message.error('请勿混用换行和英文分号 ,')
                  return
                }

                let phoneNumberList: string[] = [phoneNumbers]

                if (phoneNumbers.includes('\n')) {
                  phoneNumberList = phoneNumbers
                    .split('\n')
                    .filter((_) => _)
                    .map((num) => num.trim())
                }
                if (phoneNumbers.includes(',')) {
                  phoneNumberList = phoneNumbers
                    .split(',')
                    .filter((_) => _)
                    .map((num) => num.trim())
                }

                if (!phoneNumberList?.length) {
                  message.error('号码不能为空')
                  return
                }

                // 去重
                phoneNumberList = phoneNumberList.filter(
                  (num, i, arr) => arr.findIndex((_) => _ === num) === i
                )

                setState({
                  visible: true,
                  task: {
                    content,
                    activityId,
                    phoneNumberList,
                  },
                })
              }}
            >
              <Form.Item
                shouldUpdate
                label="短信内容"
                name="content"
                extra={
                  <div>
                    <div>短信内容最长支持 30 个字符。</div>
                    <div>
                      发送样例：【{setting.miniappName || '小程序名称'}】
                      {form.getFieldValue('content')}，点击 https://dllzff.cn/xxxxxxxx 打开【
                      {setting.miniappName || '小程序名称'}】小程序，回T退订。
                    </div>
                    {msgLongWarning && (
                      <Text type="warning">当前短信内容可能超过70字，将会分成2条短信发送</Text>
                    )}
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: '请填写短信内容',
                  },
                  {
                    message: '短信内容最长支持 30 个字符',
                    max: 30,
                  },
                  {
                    validator: (_, value) => {
                      const template = `【${setting.miniappName}】，点击 https://dllzff.cn/xxxxxxxx 打开“${setting.miniappName}”小程序，回T退订。`

                      if (template.length + (value?.length || 0) > 70) {
                        setState({
                          msgLongWarning: true,
                        })
                      } else {
                        setState({
                          msgLongWarning: false,
                        })
                      }

                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <TextArea placeholder="短信内容" />
              </Form.Item>

              <Form.Item
                required
                label="手机号码"
                name="phoneNumbers"
                extra="仅支持国内号码，如 12345678900。多个手机号码，每行一个号码，或使用英文逗号 , 分隔，目前最大支持 1000 个手机号码。"
                rules={[
                  {
                    required: true,
                    message: '请填写短信号码',
                  },
                  {
                    pattern: /^(1[0-9]\d{9}(\n|,)?)+$/,
                    message: '仅支持国内号码，仅支持换行或英文分号 , 分隔',
                  },
                ]}
              >
                <TextArea placeholder="短信号码列表" />
              </Form.Item>

              <Form.Item label="活动" required>
                <Space align="start" size="large">
                  <Form.Item
                    name="activityId"
                    extra="关联的活动"
                    rules={[
                      {
                        required: true,
                        message: '请选择关联的活动',
                      },
                    ]}
                  >
                    <IConnectEditor field={ActivityField} />
                  </Form.Item>
                  <Form.Item shouldUpdate>
                    {() => {
                      const activityId = form.getFieldValue(['activityId'])
                      if (!activityId) return ''
                      return (
                        <Button
                          type="primary"
                          onClick={() => {
                            setState({
                              activityId,
                            })
                            qrCodeRef.current?.show()
                          }}
                        >
                          体验
                        </Button>
                      )
                    }}
                  </Form.Item>
                </Space>
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
                      <Button type="primary" htmlType="submit">
                        创建
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </ProCard>
          <Modal
            centered
            visible={visible}
            title="创建发送短信任务"
            onOk={() => run(task)}
            okButtonProps={{ loading }}
            onCancel={() => setState({ visible: false })}
          >
            共计 {task?.phoneNumberList?.length || 0} 个号码，是否创建发送任务？
          </Modal>
        </Col>
      </Row>
      <QrCode activityId={activityId} actionRef={qrCodeRef} />
    </PageContainer>
  )
}

export default MessageTask
