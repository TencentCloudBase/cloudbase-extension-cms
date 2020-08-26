import { Alert, message, Button, Spin } from 'antd'
import React, { useState } from 'react'
import { useModel, history } from 'umi'
import { getPageQuery, loginWithPassword } from '@/utils'
import Footer from '@/components/Footer'
import { LoginParamsType } from '@/services/login'
import logo from '@/assets/logo.svg'
import LoginFrom from './components'
import styles from './index.less'

const { Tab, Username, Password } = LoginFrom

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
  const [type, setType] = useState<string>('account')
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>('')

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
      console.log(error)
      try {
        const e = JSON.parse(error.message)
        if (e.msg.indexOf('not enable username login') > -1) {
          message.error(
            '环境未开启用户名密码登录，请到控制台 https://console.cloud.tencent.com/tcb/env/login 开启用户名密码登录'
          )
        } else if (e?.code === 'OPERATION_FAIL') {
          message.error('用户不存在或密码错误')
        } else {
          message.error(e.message || '登录失败，请重试！')
        }
      } catch (_e) {
        message.error(error.message || '登录失败，请重试！')
      }
    }

    setSubmitting(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div>
          <div className={styles.top}>
            <div className={styles.header}>
              <a href="https://cloudbase.net" target="_blank">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>CloudBase CMS</span>
              </a>
            </div>
            <div className={styles.desc}>打造云端一体化数据运营平台</div>
          </div>

          <div className={styles.main}>
            <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
              <Tab key="account" tab="账户密码登录">
                {loginErrorMessage && !submitting && <LoginMessage content="账户或密码错误" />}

                <Username
                  name="username"
                  placeholder="用户名"
                  rules={[
                    {
                      required: true,
                      message: '请输入用户名!',
                    },
                  ]}
                />
                <Password
                  name="password"
                  placeholder="密码"
                  rules={[
                    {
                      required: true,
                      message: '请输入密码！',
                    },
                  ]}
                />
              </Tab>
              <Button
                size="large"
                className={styles.submit}
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                登录
              </Button>
            </LoginFrom>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login
