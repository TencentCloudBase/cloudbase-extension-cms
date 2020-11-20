import { message, Spin } from 'antd'
import React, { useState } from 'react'
import { useModel, history } from 'umi'
import { getCmsConfig, getPageQuery, loginWithPassword } from '@/utils'
import Footer from '@/components/Footer'
import { LoginParamsType } from '@/services/login'
import styles from './index.less'

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
      console.log(error)
      message.error(error.message || '登录失败，请重试！')
    }

    setSubmitting(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div>
          <div className={styles.top}>
            <div className={styles.header}>
              <a href={getCmsConfig('officialSiteLink')} target="_blank">
                <img alt="logo" className={styles.logo} src={getCmsConfig('cmsLogo')} />
                <span className={styles.title}>{getCmsConfig('cmsTitle')}</span>
              </a>
            </div>
            <div className={styles.desc}>打造云端一体化数据运营平台</div>
          </div>

          <div className="text-center">
            <p>请使用个人微信扫码登录</p>
            <img
              height="200px"
              src="https://636d-cms-demo-1252710547.tcb.qcloud.la/356a3079a23e24ed7ee060b5ceb27838.png?sign=b02b0359615de369c1943de0275ee6f4&t=1605787157"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login
