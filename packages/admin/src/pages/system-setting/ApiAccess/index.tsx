import _ from 'lodash'
import { useRequest } from 'umi'
import React, { createContext, useState } from 'react'
import {
  Divider,
  Button,
  Space,
  Form,
  Input,
  message,
  Switch,
  Alert,
  Checkbox,
  Modal,
  Typography,
} from 'antd'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { copyToClipboard } from '@/utils'
import { CopyTwoTone } from '@ant-design/icons'
import { createApiAuthToken, deleteApiAuthToken } from '@/services/global'

const { Text } = Typography

const ReachableContext = createContext(false)

const ActionMap = {
  read: '访问',
  modify: '修改',
  delete: '删除',
}

/**
 * restful api 访问路径
 */
const ApiAccessPath: React.FC = () => {
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { setting } = ctx.state
  const [modal, contextHolder] = Modal.useModal()

  const accessDomain = window.TcbCmsConfig.cloudAccessPath.replace('tcb-ext-cms-service', '')

  // 修改 api 路径，保留原路径
  const [keepApiPath, setKeepApiPath] = useState(false)

  // 设置 API 访问路径
  const { loading, run: setApiPath } = useRequest(
    async (path: string) => {
      await ctx.mr.updateSetting({
        keepApiPath,
        apiAccessPath: path,
      })
    },
    {
      manual: true,
      onSuccess: () => message.success('API 访问路径设置成功！'),
      onError: (e) => message.error(`更新失败 ${e.message}`),
    }
  )

  // 弹窗配置
  const config = (v: { path: string }) => ({
    title: '警告',
    okText: '确定',
    cancelText: '取消',
    onOk: () => setApiPath(v?.path),
    content: (
      <ReachableContext.Consumer>
        {(value) => {
          console.log(value)
          return (
            <>
              修改路径将会删除原服务路径，会导致原服务路径无法访问，是否确认修改？
              <br />
              <br />
              <Checkbox
                checked={value}
                onChange={(e) => {
                  setKeepApiPath(e.target.checked)
                }}
              >
                保留原 API 路径
              </Checkbox>
            </>
          )
        }}
      </ReachableContext.Consumer>
    ),
  })

  return (
    <ReachableContext.Provider value={keepApiPath}>
      <Typography.Title level={3}>访问路径</Typography.Title>
      <Form
        layout="vertical"
        labelAlign="left"
        initialValues={{
          path: setting.apiAccessPath,
        }}
        onFinish={(v = {}) => {
          // API 路径已经存在，需要删除原路径，要警告
          if (setting.apiAccessPath) {
            modal.confirm(config(v))
          } else {
            setApiPath(v?.path)
          }
        }}
      >
        {!setting.apiAccessPath && (
          <Alert
            type="warning"
            message="请设定 API 访问路径，否则无法使用 API 访问"
            style={{ marginBottom: '10px' }}
          />
        )}
        <Form.Item
          label="使用 RESTful API 时的基础访问路径"
          name="path"
          rules={[
            { required: true, message: '请输入 API 访问的路径！' },
            {
              pattern: /^(?!\/).*$/,
              message: '路径无需以 / 开头',
            },
          ]}
        >
          <Input
            addonBefore={
              <Text ellipsis style={{ maxWidth: '400px' }}>
                {`https://${accessDomain}`}
              </Text>
            }
            addonAfter={
              <CopyTwoTone
                onClick={() => {
                  if (!setting.apiAccessPath) {
                    message.error('请设定 API 访问路径')
                  } else {
                    copyToClipboard(`https://${accessDomain}${setting.apiAccessPath}`)
                  }
                }}
              />
            }
            placeholder="API 访问的路径，如 rest-api"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" loading={loading} htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
      {contextHolder}
    </ReachableContext.Provider>
  )
}

/**
 * restful api 访问权限控制
 */
const ApiPermission = () => {
  const ctx = useConcent<{}, GlobalCtx>('global')
  const {
    state: { setting },
  } = ctx

  // 开启/关闭 API 鉴权
  const { loading: toggleLoading, run: toggleApiAuth } = useRequest(
    async (v: boolean) => {
      await ctx.mr.updateSetting({
        enableApiAuth: v,
      })
    },
    {
      manual: true,
      onSuccess: (_: any, [v]) => message.success(`API 鉴权${v ? '启用' : '关闭'}成功！`),
      onError: (e) => message.error(`更新失败 ${e.message}`),
    }
  )

  // 创建 API Token
  const { run: createApiToken, loading: createLoading } = useRequest(
    async (data: { name: string; permissions: string[] }) => {
      await createApiAuthToken(data)
      // 重载配置
      await ctx.mr.getSetting()
    },
    {
      manual: true,
      onSuccess: () => message.success('创建 API Token 成功'),
      onError: (e) => message.error(`创建 API Token 失败: ${e.message}`),
    }
  )

  return (
    <>
      <Typography.Title level={3}>访问鉴权</Typography.Title>
      <Space className="mb-5">
        <Switch loading={toggleLoading} checked={setting?.enableApiAuth} onChange={toggleApiAuth} />
        <span>API 访问鉴权已{setting.enableApiAuth ? '开启' : '关闭'}</span>
      </Space>
      <Form
        layout="vertical"
        labelAlign="left"
        initialValues={setting}
        onFinish={(v = {}) => {
          createApiToken({
            name: v.name,
            permissions: v.permissions,
          })
        }}
      >
        <Form.Item
          label="API Token 名称"
          name="name"
          rules={[
            { required: true, message: '请输入 API Token 名称！' },
            {
              pattern: /^(?!\/).*$/,
              message: '路径无需以 / 开头',
            },
          ]}
        >
          <Input placeholder="API 访问 Token 名称" />
        </Form.Item>

        <Form.Item
          label="API Token 权限"
          name="permissions"
          rules={[{ required: true, message: '请选择 API Token 权限！' }]}
        >
          <Checkbox.Group
            options={[
              {
                label: '允许访问',
                value: 'read',
              },
              {
                label: '允许修改',
                value: 'modify',
              },
              {
                label: '允许删除',
                value: 'delete',
              },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" loading={createLoading} htmlType="submit">
            创建 Token
          </Button>
        </Form.Item>
      </Form>

      {!!setting?.apiAuthTokens?.length && (
        <>
          <Typography.Title level={4} className="mb-5">
            已有 API Token
          </Typography.Title>
          {setting.apiAuthTokens.map((token, i) => (
            <div key={i} className="flex justify-between my-2">
              <div>{token.name}</div>
              <div>
                {token.permissions?.length
                  ? token.permissions.map((_) => ActionMap[_]).join('/')
                  : '无权限'}
              </div>
              <div>
                <Button
                  type="text"
                  style={{ color: '#0052d9' }}
                  onClick={() => {
                    copyToClipboard(token.token)
                    message.success('复制成功')
                  }}
                >
                  复制
                </Button>
                <Button
                  danger
                  type="text"
                  onClick={() => {
                    Modal.confirm({
                      centered: true,
                      title: '确认删除此 Token，此操作不可恢复',
                      onOk: async () => {
                        await deleteApiAuthToken(token.id)
                        ctx.mr.getSetting()
                      },
                    })
                  }}
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default (): React.ReactElement => {
  const ctx = useConcent<{}, GlobalCtx>('global')
  const { setting } = ctx.state

  // 开启/关闭 API 访问
  const { loading: changeLoading, run: toggleApiAccess } = useRequest(
    async (v: boolean) => {
      await ctx.mr.updateSetting({
        enableApiAccess: v,
      })
    },
    {
      manual: true,
      onError: (e) => message.error(`更新失败 ${e.message}`),
      onSuccess: (_: any, [v]) => message.success(`${v ? '启用' : '关闭'} API 访问成功！`),
    }
  )

  if (!setting?.enableApiAccess) {
    return (
      <Space>
        <Switch
          loading={changeLoading}
          checked={setting?.enableApiAccess}
          onChange={toggleApiAccess}
        />
        <span>启用 API 访问</span>
      </Space>
    )
  }

  return (
    <div>
      <Space>
        <Switch
          loading={changeLoading}
          checked={setting?.enableApiAccess}
          onChange={toggleApiAccess}
        />
        <span>API 访问已{setting.enableApiAccess ? '开启' : '关闭'}</span>
      </Space>
      <Divider />
      <ApiAccessPath />
      <Divider />
      <ApiPermission />
    </div>
  )
}
