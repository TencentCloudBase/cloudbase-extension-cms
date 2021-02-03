import React, { MutableRefObject, useEffect, useRef } from 'react'
import { useParams, useRequest, history, useModel } from 'umi'
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
} from 'antd'
import { useSetState } from 'react-use'
import { callWxOpenAPI, downloadAndSaveFile, uploadFile } from '@/utils'
import { createBatchTask } from '@/services/operation'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { IConnectEditor } from './Connect'
import { ActivityField } from './columns'

const { Text, Link } = Typography
const { TextArea } = Input

interface Task {
  content: string
  activityId: string
  phoneNumbers: string
  phoneNumberFile: File[]
}

const getMessageTemplate = (miniappName = '', content = '') => `【${
  miniappName || '小程序名称'
}】${content}，跳转小程序 https://dllzff.cn/xxxxxxxx
回T退订`

// 30M
const MAX_FILE_SIZE = 30 * 1024 * 1024

const MessageTask: React.FC = () => {
  const qrCodeRef = useRef<any>()
  const modalRef = useRef<any>(null)
  const [form] = Form.useForm()
  const { projectId } = useParams<any>()
  const { initialState } = useModel('@@initialState')
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state || {}

  const [
    { visible, task, msgLongWarning, activityId, sendMessageType },
    setState,
  ] = useSetState<any>({
    task: {},
    totalNumber: 0,
    visible: false,
    activityId: '',
    msgLongWarning: false,
    sendMessageType: 'file',
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
                console.log(v)
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
                      content,
                      activityId,
                      phoneNumberFile: phoneNumberFile?.[0],
                    },
                  })
                  modalRef?.current.show()
                }
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
                      发送样例：
                      {getMessageTemplate(setting?.miniappName, form.getFieldValue('content'))}
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
                      const template = getMessageTemplate(setting.miniappName)

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

              {sendMessageType === 'manual' ? (
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
                    <Upload.Dragger maxCount={1} accept=".xlsx,.csv">
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">点击或拖拽上传号码包文件</p>
                    </Upload.Dragger>
                  </Form.Item>
                  <Text strong>
                    单次群发任务最多支持 100 万条号码，请上传 XLSX 文件，大小 30M 以内
                  </Text>
                  <br />
                  <Text strong>
                    请在模板内填写手机号码，
                    <Link
                      onClick={() => {
                        downloadAndSaveFile(
                          './cmsSmsTemplate.xlsx',
                          'cmsSmsTemplate.xlsx'
                        ).then(() => message.success('下载模板文件成功'))
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
            <BatchTaskConfirmModal actionRef={modalRef} phoneNumberFile={task?.phoneNumberFile} />
          )}
        </Col>
      </Row>
      <QrCode disableChannel activityId={activityId} actionRef={qrCodeRef} />
    </PageContainer>
  )
}

/**
 * 文件批量发送短信确认弹窗
 */
const BatchTaskConfirmModal: React.FC<{
  actionRef: MutableRefObject<{
    show: () => void
  }>
  phoneNumberFile: any
}> = ({ actionRef, phoneNumberFile }) => {
  const [{ visible }, setState] = useSetState({
    visible: false,
  })

  const show = () =>
    setState({
      visible: true,
    })

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
  const { data, loading } = useRequest(
    async () => {
      if (!phoneNumberFile || !visible) return

      // 上传文件
      const fileId = await uploadFile({
        file: phoneNumberFile,
        // 生成较长的文件名
        filenameLength: 128,
      })

      console.log(fileId)

      const res = await callWxOpenAPI('getSmsTaskAnalysisData', {
        fileId,
      })

      console.log(res)

      let rest = 0

      // 短信剩余量
      if (res.usage) {
        rest = res.usage.Quota - res.usage.Usage
      }

      console.log(rest)

      return {
        data: { rest },
      }
    },
    {
      refreshDeps: [phoneNumberFile, visible],
    }
  )

  return (
    <Modal
      centered
      visible={visible}
      title="创建发送短信任务"
      onOk={() => {}}
      okButtonProps={{ disabled: loading }}
      onCancel={() => setState({ visible: false })}
    >
      {loading ? (
        <p className="text-center">文件分析中，请稍等...</p>
      ) : (
        <>
          <p>将短信发送给 {} 人</p>
          <p>
            当前国内文本短信剩余量 <Text type="danger">{data?.rest}</Text> 条
          </p>
          <p>
            若短信发送人数超过余量，会导致超出部分发送失败，请及时
            <Link href="https://cloud.tencent.com/act/pro/tcbsms">续订套餐包</Link>
          </p>
        </>
      )}
    </Modal>
  )
}

/**
 * 解析号码列表
 */
const resolveAndCheckPhoneNumbers = (phoneNumbers: string): string[] | undefined => {
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
  phoneNumberList = phoneNumberList.filter((num, i, arr) => arr.findIndex((_) => _ === num) === i)

  return phoneNumberList
}

export default MessageTask
