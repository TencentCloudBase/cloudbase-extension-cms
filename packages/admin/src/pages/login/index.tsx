import { useModel, history } from 'umi'
import React, { useState, useEffect } from 'react'
import { LockTwoTone, UserOutlined } from '@ant-design/icons'
import { Alert, message, Button, Spin, Card, Typography, Form, Input } from 'antd'
import { getCmsConfig, getPageQuery, loginWithPassword } from '@/utils'
import Footer from '@/components/Footer'
import { LoginParamsType } from '@/services/login'
import styles from './index.less'

const { Title } = Typography
const FormItem = Form.Item

const LoginMessage: React.FC<{
  content: string
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
)

/**
 * 此方法会跳转到 redirect 参数所在的位置
 */
const replaceGoto = () => {
  const urlParams = new URL(window.location.href)
  const params = getPageQuery()
  let { redirect } = params as { redirect: string }

  const historyType = window.TcbCmsConfig.history

  if (redirect) {
    const redirectUrlParams = new URL(redirect)
    if (redirectUrlParams.origin === urlParams.origin) {
      redirect = redirect.substr(urlParams.origin.length)
      if (redirect.match(/^\/.*#/)) {
        redirect = redirect.substr(redirect.indexOf('#') + 1)
      }
    } else {
      window.location.href = historyType === 'hash' ? location.pathname : '/'
      return
    }
  }

  if (historyType === 'hash') {
    window.location.href = location.pathname
  } else {
    window.location.href = urlParams.href.split(urlParams.pathname)[0] + (redirect || '/home')
  }
}

const Login: React.FC<{}> = () => {
  const [submitting, setSubmitting] = useState(false)
  const { refresh, initialState } = useModel('@@initialState')
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>('')

  console.log(initialState)

  // 已登录
  if (initialState?.currentUser?._id && initialState?.currentUser?.username) {
    history.push('/home')
    return <Spin />
  }

  const handleSubmit = async (values: LoginParamsType) => {
    setSubmitting(true)
    setLoginErrorMessage('')

    const { username, password } = values

    try {
      // 用户名密码登录
      await loginWithPassword(username.trim(), password.trim())
      message.success('登录成功')
      replaceGoto()
      setTimeout(() => {
        refresh()
      }, 1000)
    } catch (error) {
      // 登录异常
      console.log(error)

      try {
        const e = JSON.parse(error.message)
        if (e.msg.indexOf('not enable username login') > -1) {
          setLoginErrorMessage(
            '环境未开启用户名密码登录，请到控制台 https://console.cloud.tencent.com/tcb/env/login 开启用户名密码登录'
          )
        } else if (e?.code === 'OPERATION_FAIL') {
          setLoginErrorMessage('用户不存在或密码错误')
        } else {
          setLoginErrorMessage(e.message || '登录失败，请重试！')
        }
      } catch (_e) {
        setLoginErrorMessage(error.message || '登录失败，请重试！')
      }
    }

    setSubmitting(false)
  }

  // 从低码平台登录
  useEffect(() => {
    // 监控登录信息
    const messageListener = async (event: WindowEventMap['message']) => {
      if (event.data?.source === 'react-devtools-bridge') return

      console.log('CMS 收到信息', event.data, event.origin)

      try {
        const data = event?.data ? JSON.parse(event.data) : {}
        if (data?.from !== 'lowcode') return
        window?.parent.postMessage(
          JSON.stringify({
            from: 'cms',
            message: 'received message',
          }),
          '*'
        )

        const { password, username } = data
        await handleSubmit({
          password,
          username,
        })
        // 响应低码平台
        window?.parent.postMessage(
          JSON.stringify({
            from: 'cms',
            status: 'success',
          }),
          '*'
        )
      } catch (error) {
        if (window.parent === window.self) return
        // 响应低码平台
        window?.parent.postMessage(
          JSON.stringify({
            from: 'cms',
            status: 'fail',
            message: error.message,
          }),
          '*'
        )
      }
    }

    window.addEventListener('message', messageListener, false)
    return () => {
      window.removeEventListener('message', messageListener)
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Card className="rounded-lg">
          <div className="mt-10 mb-10">
            <div className={styles.top}>
              <div className={styles.header}>
                <a href="https://cloudbase.net" target="_blank">
                  <img alt="logo" className={styles.logo} src={getCmsConfig('cmsLogo')} />
                  <span className={styles.title}>{getCmsConfig('cmsTitle')}</span>
                </a>
              </div>
              <div className={styles.desc}>打造云端一体化数据运营平台</div>
            </div>

            <div className={styles.main}>
              <Form
                onFinish={(values) => {
                  handleSubmit(values)
                }}
              >
                <Title level={4} className="text-center mt-10 mb-6">
                  账户密码登录
                </Title>
                {loginErrorMessage && !submitting && <LoginMessage content={loginErrorMessage} />}
                <FormItem
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: '请输入用户名!',
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="用户名"
                    prefix={<UserOutlined twoToneColor="#0052d9" className={styles.prefixIcon} />}
                  />
                </FormItem>
                <FormItem
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: '请输入密码！',
                    },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="密码"
                    prefix={<LockTwoTone twoToneColor="#0052d9" />}
                  />
                </FormItem>
                <Button
                  size="large"
                  className={styles.submit}
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                >
                  登录
                </Button>
              </Form>
            </div>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

export default Login
