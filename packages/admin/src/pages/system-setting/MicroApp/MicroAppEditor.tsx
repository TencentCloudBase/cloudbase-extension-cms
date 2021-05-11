import React from 'react'
import { useConcent } from 'concent'
import { Typography, Card, message } from 'antd'
import { GlobalCtx, MicroAppCtx } from 'typings/store'
import ProForm, { ProFormDependency, ProFormField, ProFormText } from '@ant-design/pro-form'
import { createMicroApp, updateMicroApp } from '@/services/global'
import { DraggerUpload } from '@/components/Upload'
import BackNavigator from '@/components/BackNavigator'
import SettingContainer from '../SettingContainer'

const { Title } = Typography

export default (): React.ReactNode => {
  const ctx = useConcent<{}, MicroAppCtx>('microApp')
  const globalCtx = useConcent<{}, GlobalCtx>('global')

  const { selectedApp, appAction } = ctx.state

  const actionText = appAction === 'edit' ? '更新' : '新建'

  const initialValues = appAction === 'edit' ? selectedApp : {}

  return (
    <SettingContainer>
      <BackNavigator />
      <Title level={3}>{actionText}微应用</Title>
      <Card style={{ minHeight: '480px' }}>
        <ProForm
          initialValues={initialValues}
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
          onFinish={async (data: any) => {
            // assign _id
            const app = {
              ...initialValues,
              ...data,
            }

            if (appAction === 'create') {
              await createMicroApp(app)
              message.success('创建微应用成功！')
            } else {
              await updateMicroApp(app)
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
          <ProFormDependency name={['id']}>
            {({ id }) => {
              return (
                <ProFormField
                  required
                  name="fileIDList"
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
                  <DraggerUpload maxCount={1} accept=".zip" uploadTip="点击或拖拽 ZIP 文件上传" />
                </ProFormField>
              )
            }}
          </ProFormDependency>
        </ProForm>
      </Card>
    </SettingContainer>
  )
}
