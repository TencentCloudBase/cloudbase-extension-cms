import { Alert, message, Button } from 'antd'
import React, { useState } from 'react'
import { useModel } from 'umi'
import { getPageQuery } from '@/utils/utils'
import { LoginParamsType, accountLogin } from '@/services/login'
import Footer from '@/components/Footer'
import LoginFrom from './components'
import styles from './index.less'
import { customLogin } from '@/utils'

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
    if (redirect) {
        const redirectUrlParams = new URL(redirect)
        if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length)
            if (redirect.match(/^\/.*#/)) {
                redirect = redirect.substr(redirect.indexOf('#') + 1)
            }
        } else {
            window.location.href = '/'
            return
        }
    }

    window.location.href = urlParams.href.split(urlParams.pathname)[0] + (redirect || '/home')
}

const Login: React.FC<{}> = () => {
    const [submitting, setSubmitting] = useState(false)
    const { refresh } = useModel('@@initialState')
    const [type, setType] = useState<string>('account')
    const [loginErrorMessage, setLoginErrorMessage] = useState<string>('')

    const handleSubmit = async (values: LoginParamsType) => {
        setSubmitting(true)
        setLoginErrorMessage('')

        try {
            // 登录
            const res = await accountLogin({ ...values, type })

            // 登录成功
            if (res.ticket) {
                await customLogin(res.ticket)
                message.success('登录成功')
                replaceGoto()
                setTimeout(() => {
                    refresh()
                }, 1000)
                return
            } else {
                setLoginErrorMessage(res.message || '登录失败，请重试！')
            }
        } catch (e) {
            message.error(e.message || '登录失败，请重试！')
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
                                <img alt="logo" className={styles.logo} src="/icon.svg" />
                                <span className={styles.title}>CloudBase CMS</span>
                            </a>
                        </div>
                        <div className={styles.desc}>打造云端一体化运营平台</div>
                    </div>

                    <div className={styles.main}>
                        <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
                            <Tab key="account" tab="账户密码登录">
                                {loginErrorMessage && !submitting && (
                                    <LoginMessage content="账户或密码错误" />
                                )}

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
