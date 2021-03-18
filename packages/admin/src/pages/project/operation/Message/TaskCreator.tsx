import React, { MutableRefObject, useEffect, useRef } from 'react'
import { useRequest, history } from 'umi'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { InboxOutlined, LeftCircleTwoTone } from '@ant-design/icons'
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
  Radio,
  Upload,
  Progress,
  Alert,
} from 'antd'
import { useSetState } from 'react-use'
import { callWxOpenAPI, downloadAndSaveFile, getProjectId, redirectTo, uploadFile } from '@/utils'
import { createBatchTask } from '@/services/operation'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { IConnectEditor } from './Connect'
import { ActivityField } from './columns'
import { resolveAndCheckPhoneNumbers } from './util'

const { Text, Link } = Typography
const { TextArea } = Input

interface Task {
  content: string
  activityId: string
  phoneNumbers: string
  phoneNumberFile: any[]
}

// 短信模板
const getMessageTemplate = (miniappName = '', content = '') => `【${
  miniappName || '小程序名称'
}】${content}，跳转小程序 https://tcbe.cn/xxxxxxxx
回T退订`

// 号码包文件最大值：30M
const MAX_FILE_SIZE = 30 * 1024 * 1024

const MessageTask: React.FC = () => {
  const qrCodeRef = useRef<any>()
  const modalRef = useRef<any>(null)
  const [form] = Form.useForm()
  const projectId = getProjectId()
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state || {}

  const [{ visible, task, activityId, sendMessageType }, setState] = useSetState<any>({
    task: {},
    totalNumber: 0,
    visible: false,
    activityId: '',
    sendMessageType: 'manual',
  })

  if (!setting?.enableOperation) {
    redirectTo('operation')
    return <span />
  }

  // 创建发送任务
  const { run, loading } = useRequest(
    async (payload: any) => {
      const { taskId } = await createBatchTask(projectId, payload)

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
        // 创建任务失败
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
            <h4>发送短信方式</h4>
            <Radio.Group
              value={sendMessageType}
              buttonStyle="solid"
              className="mb-5"
              onChange={(e) => {
                setState({
                  sendMessageType: e.target.value,
                })
              }}
            >
              <Radio.Button value="manual">手动输入号码</Radio.Button>
              <Radio.Button value="file">上传号码包文件</Radio.Button>
            </Radio.Group>
            <Form
              form={form}
              name="basic"
              layout="vertical"
              onFinish={(
                v: Task = {
                  content: '',
                  activityId: '',
                  phoneNumbers: '',
                  phoneNumberFile: [],
                }
              ) => {
                // 任务信息
                const { phoneNumbers, phoneNumberFile, content, activityId } = v

                // 手动输入号码
                if (sendMessageType === 'manual') {
                  const phoneNumberList = resolveAndCheckPhoneNumbers(phoneNumbers)
                  if (!phoneNumberList) return
                  setState({
                    visible: true,
                    task: {
                      content,
                      activityId,
                      phoneNumberList,
                    },
                  })
                } else {
                  setState({
                    task: {
                      activityId,
                      phoneNumberFile: phoneNumberFile?.[0]?.originFileObj,
                    },
                  })
                  modalRef?.current.show()
                }
              }}
            >
              {sendMessageType === 'manual' ? (
                <>
                  <Form.Item
                    shouldUpdate
                    label="短信内容"
                    name="content"
                    extra={
                      <Form.Item shouldUpdate className="mb-0">
                        {() => (
                          <Text type="secondary">
                            短信预览：
                            {getMessageTemplate(
                              setting?.miniappName,
                              form.getFieldValue('content')
                            )}
                          </Text>
                        )}
                      </Form.Item>
                    }
                    rules={[
                      {
                        required: true,
                        message: '请填写短信内容',
                      },
                      {
                        validator: (_, value) => {
                          const template = getMessageTemplate(setting.miniappName)

                          if (template.length + (value?.length || 0) > 70) {
                            return Promise.reject('短信超出 70 个字符，无法发送，请精简短信内容')
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
                </>
              ) : (
                <Form.Item required label="手机号码包文件">
                  <Form.Item
                    valuePropName="fileList"
                    name="phoneNumberFile"
                    rules={[
                      {
                        required: true,
                        message: '请上传号码文件',
                      },
                      {
                        validator: (_, value) => {
                          const file = value?.[0]
                          if (!file) {
                            return Promise.reject('请上传号码文件')
                          }

                          if (file?.size > MAX_FILE_SIZE) {
                            return Promise.reject('号码包文件不能大于 30M')
                          }

                          return Promise.resolve()
                        },
                      },
                    ]}
                    getValueFromEvent={(e: any) => {
                      if (Array.isArray(e)) {
                        return e
                      }
                      return e?.fileList
                    }}
                    className="mb-3"
                  >
                    <Upload.Dragger maxCount={1} accept=".csv" beforeUpload={() => false}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">点击或拖拽上传号码包文件</p>
                    </Upload.Dragger>
                  </Form.Item>
                  <Text strong>
                    单次群发任务最多支持 100 万条号码，请上传 CSV 文件，大小 30M 以内
                  </Text>
                  <br />
                  <Text strong>
                    请在模板内填写手机号码、短信内容，
                    <Link
                      onClick={() => {
                        downloadAndSaveFile('./cmsSmsTemplate.csv', 'cmsSmsTemplate.csv').then(() =>
                          message.success('下载模板文件成功')
                        )
                      }}
                    >
                      下载模板
                    </Link>
                  </Text>
                </Form.Item>
              )}

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
          {sendMessageType === 'manual' ? (
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
          ) : (
            <SmsFileTaskModal actionRef={modalRef} task={task} />
          )}
        </Col>
      </Row>
      <QrCode disableChannel activityId={activityId} actionRef={qrCodeRef} />
    </PageContainer>
  )
}

/**
 * 通过号码包文件发送短信分析、创建任务
 */
const SmsFileTaskModal: React.FC<{
  actionRef: MutableRefObject<{
    show: () => void
  }>
  task: {
    phoneNumberFile: any
    activityId: string
  }
}> = ({ actionRef, task = {} }) => {
  const projectId = getProjectId()
  const { phoneNumberFile, activityId } = task
  const [{ visible, uploadPercent }, setState] = useSetState({
    visible: false,
    uploadPercent: 0,
  })

  // 弹窗控制
  const show = () => setState({ visible: true })
  const hideModal = () => setState({ visible: false })

  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.show = show
    } else {
      actionRef.current = {
        show,
      }
    }
  }, [])

  // 分析号码包
  const { data: analysisResult, loading } = useRequest(
    async () => {
      if (!visible || !activityId) return
      // 重置上传进度
      setState({ uploadPercent: 0 })

      // 上传文件到云存储
      const fileId = await uploadFile({
        file: phoneNumberFile,
        // 生成较长的文件名
        filenameLength: 24,
        onProgress: (v) => setState({ uploadPercent: v }),
      })

      // 获取文件分析结果
      const res = await callWxOpenAPI('getSmsFileAnalysisData', {
        fileId,
        activityId,
        projectId,
      })

      let restAmount = 0

      // 短信剩余量
      if (res.usage) {
        restAmount = res.usage.Quota - res.usage.Usage
      }

      return {
        data: { restAmount, ...res },
      }
    },
    {
      refreshDeps: [phoneNumberFile, visible],
      onError: (e) => {
        hideModal()
        message.error(`文件分析失败：${e.message}`)
      },
    }
  )

  // 余量不足时，禁用发送按钮
  const sendDisable =
    analysisResult?.restAmount <= 0 || analysisResult?.total > analysisResult?.restAmount

  // 创建发送任务
  const { loading: taskLoading, run: createSendingTask } = useRequest(
    async ({ fileUri, taskId }: { fileUri: string; taskId: string }) => {
      // 文件不存在
      if (!fileUri || !taskId) {
        message.error('文件检测结果不存在')
        return
      }

      await callWxOpenAPI('createSendSmsTaskByFile', {
        fileUri,
        taskId,
      })
    },
    {
      manual: true,
      refreshDeps: [analysisResult],
      onSuccess: () => {
        hideModal()
        message.success('创建任务成功')
        history.goBack()
      },
      onError: (e) => message.error(`创建任务失败：${e.message}`),
    }
  )

  return (
    <Modal
      centered
      visible={visible}
      title="创建发送短信任务"
      onOk={() => {
        // 创建发送任务
        createSendingTask({
          taskId: analysisResult?.taskId,
          fileUri: analysisResult?.fileUri,
        })
      }}
      onCancel={() => setState({ visible: false })}
      okButtonProps={{ loading: loading || taskLoading, disabled: sendDisable }}
    >
      {analysisResult?.restAmount <= 0 && <Alert message="短信余量不足，无法发送" type="error" />}
      {analysisResult?.total > analysisResult?.restAmount && (
        <Alert message="短信发送人数超过可用余量，无法发送" type="error" />
      )}
      {loading ? (
        <div>
          {uploadPercent !== 100 && (
            <Space>
              <span>文件上传中</span>
              <Progress type="line" percent={uploadPercent} style={{ width: '300px' }} />
            </Space>
          )}
          <p className="text-center mt-3">文件分析中，请稍等...</p>
        </div>
      ) : (
        <div className="mt-3">
          <p>
            将短信发送给 <Text type="danger">{analysisResult?.total}</Text> 人
          </p>
          <p>
            当前国内文本短信剩余量 <Text type="danger">{analysisResult?.restAmount}</Text> 条
          </p>
          <p>
            若短信发送人数超过余量，会导致超出部分发送失败，请及时
            <Link href="https://cloud.tencent.com/act/pro/tcbsms" target="_blank">
              续订套餐包
            </Link>
          </p>
        </div>
      )}
    </Modal>
  )
}

export default MessageTask
