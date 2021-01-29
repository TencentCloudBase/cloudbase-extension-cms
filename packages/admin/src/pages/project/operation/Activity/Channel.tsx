import React, { useState } from 'react'
import { useRequest } from 'umi'
import { Form, Modal, Button, Alert, message, Input, Space, Skeleton } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { DefaultChannels } from '@/common'

/**
 * 渠道管理
 */
const Channels: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { setting } = ctx.state

  if (!setting) {
    return <Skeleton />
  }

  // 关闭弹窗
  const closeModal = () => setVisible(false)

  // 更新渠道
  const { run, loading } = useRequest(
    async (v: any) => {
      await ctx.mr.updateSetting({
        activityChannels: v.channels,
      })
    },
    {
      manual: true,
      onSuccess: () => {
        closeModal()
        message.success('保存成功')
      },
      onError: (e) => message.error(`保存失败：${e.message}`),
    }
  )

  const channels = setting?.activityChannels || []

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        渠道管理
      </Button>
      <Modal
        centered
        destroyOnClose
        width={600}
        title="渠道管理"
        closable={true}
        footer={null}
        visible={visible}
        onCancel={closeModal}
      >
        <Alert
          type="info"
          message="活动生成的 H5 页面短链可投放在短信、邮件、微信外 APP 内等多种渠道，每个渠道都将生成单独的链接，以区分统计数据"
          className="mt-3"
        />
        <br />

        <div className="flex">
          <h4 style={{ width: '45%' }}>渠道 ID</h4>
          <h4 style={{ marginLeft: '5%' }}>渠道名称</h4>
        </div>

        <Form
          layout="vertical"
          onFinish={(v = {}) => run(v)}
          initialValues={{
            channels,
          }}
        >
          {DefaultChannels.map((channel, index) => (
            <Form.Item key={index}>
              <Form.Item noStyle>
                <Input disabled value={channel.value} style={{ width: '45%' }} />
              </Form.Item>
              <Form.Item noStyle>
                <Input disabled value={channel.label} style={{ marginLeft: '5%', width: '40%' }} />
              </Form.Item>
            </Form.Item>
          ))}

          <Form.Item>
            <Form.List name="channels">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields?.map((field, index) => {
                      return (
                        <Form.Item key={index}>
                          <Form.Item
                            noStyle
                            name={[field.name, 'value']}
                            rules={[
                              {
                                required: true,
                                message: '请输入渠道 ID',
                              },
                              {
                                max: 10,
                                message: '不能超过 10 个字符',
                              },
                              {
                                pattern: /^[a-zA-Z0-9]+$/g,
                                message: '请输入英文字母的组合',
                              },
                            ]}
                            validateTrigger={['onChange', 'onBlur']}
                          >
                            <Input
                              placeholder="渠道 ID，长度小于 10 的英文字符"
                              style={{ width: '45%' }}
                            />
                          </Form.Item>
                          <Form.Item
                            noStyle
                            name={[field.name, 'label']}
                            rules={[
                              {
                                required: true,
                                message: '请输入渠道名称',
                              },
                            ]}
                            validateTrigger={['onChange', 'onBlur']}
                          >
                            <Input
                              placeholder="渠道名称，中文字符"
                              style={{ marginLeft: '5%', width: '40%' }}
                            />
                          </Form.Item>
                          <MinusCircleOutlined
                            className="dynamic-delete-button"
                            style={{ margin: '0 8px' }}
                            onClick={() => {
                              remove(field.name)
                            }}
                          />
                        </Form.Item>
                      )
                    })}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          add()
                        }}
                        style={{ width: '60%' }}
                      >
                        <PlusOutlined /> 添加渠道
                      </Button>
                    </Form.Item>
                  </div>
                )
              }}
            </Form.List>
          </Form.Item>
          <Form.Item>
            <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeModal}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Channels
