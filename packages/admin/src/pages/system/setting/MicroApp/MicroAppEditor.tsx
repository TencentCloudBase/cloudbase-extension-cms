import { useConcent } from 'concent'
import React, { useRef } from 'react'
import { Typography, Card, FormInstance, message, Alert } from 'antd'
import { GlobalCtx, MicroAppCtx } from 'typings/store'
import ProForm, { ProFormDependency, ProFormField, ProFormText } from '@ant-design/pro-form'
import { random } from '@/utils'
import { createMicroApp, updateMicroApp } from '@/services/global'
import { DraggerUpload } from '@/components/Upload'
import BackNavigator from '@/components/BackNavigator'
import SettingContainer from '../SettingContainer'

const { Title, Text } = Typography

export default (): React.ReactNode => {
  const formRef = useRef<FormInstance>()
  const ctx = useConcent<{}, MicroAppCtx>('microApp')
  const globalCtx = useConcent<{}, GlobalCtx>('global')

  const { selectedApp, appAction } = ctx.state

  const actionText = appAction === 'edit' ? '更新' : '新建'

  const initialValues =
    appAction === 'edit'
      ? selectedApp
      : {
          id: random(8),
        }

  return (
    <SettingContainer>
      <BackNavigator />
      <Title level={3}>{actionText}微应用</Title>
      <Card style={{ minHeight: '480px' }}>
        <ProForm
          formRef={formRef}
          initialValues={initialValues}
          onValuesChange={(v, values) => {
            // ID 变更，清空文件列表
            if (v.id) {
              formRef.current?.setFieldsValue({
                ...values,
                fileList: [],
              })
            }
          }}
          submitter={{
            resetButtonProps: {
              style: {
                display: 'none',
              },
            },
            render: (props, doms) => {
              return <div className="text-right mt-10">{doms}</div>
            },
          }}
          onFinish={async (data: MicroApp) => {
            if (appAction === 'create') {
              await createMicroApp(data)
              message.success('创建微应用成功！')
            } else {
              await updateMicroApp(data)
              message.success('更新微应用成功！')
            }

            // 刷新信息
            globalCtx.mr.getSetting()
            // 返回，刷新页面，重新加载 app 信息
            history.back()
            setTimeout(() => {
              window.location.reload()
            }, 200)
          }}
        >
          <ProFormText
            name="id"
            label="微应用 ID"
            placeholder="请输入微应用的 ID，仅支持英文字母和数字"
            rules={[
              {
                pattern: /^[a-zA-Z0-9]+$/,
                message: '仅支持英文字母和数字',
              },
              {
                required: true,
                message: '请输入微应用 ID',
              },
            ]}
          />
          <ProFormText
            required
            name="title"
            label="微应用名称"
            placeholder="请输入微应用的名称"
            rules={[
              {
                required: true,
                message: '请输入微应用名称',
              },
            ]}
          />
          {appAction === 'edit' && (
            <Alert
              showIcon
              type="warning"
              className="mb-5"
              message={<Title level={4}>更新提示</Title>}
              description={
                <Text strong>
                  上传文件操作，无需提交即会更新已有微应用的文件，请勿随意上传文件！
                </Text>
              }
            />
          )}
          <ProFormDependency name={['id']}>
            {({ id }) => {
              return (
                <ProFormField
                  required
                  name="fileList"
                  label="微应用文件"
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (!value?.length) {
                          return Promise.reject('文件不能为空！')
                        } else {
                          return Promise.resolve()
                        }
                      },
                    },
                  ]}
                >
                  <DraggerUpload
                    maxCount={1}
                    accept=".zip"
                    uploadTip={
                      appAction === 'create'
                        ? '点击或拖拽 ZIP 文件上传'
                        : '点击或拖拽 ZIP 文件更新微应用'
                    }
                  />
                </ProFormField>
              )
            }}
          </ProFormDependency>
        </ProForm>
      </Card>
    </SettingContainer>
  )
}
