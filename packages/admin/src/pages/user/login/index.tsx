import { Alert, Checkbox, message } from 'antd'
import React, { useState } from 'react'
import { Link, useModel } from 'umi'
import { getPageQuery } from '@/utils/utils'
import { LoginParamsType, accountLogin } from '@/services/login'
import Footer from '@/components/Footer'
import LoginFrom from './components/Login'
import styles from './style.less'

const { Tab, Username, Password, Submit } = LoginFrom

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
    window.location.href = urlParams.href.split(urlParams.pathname)[0] + (redirect || '/')
}

const Login: React.FC<{}> = () => {
    const [userLoginState, setUserLoginState] = useState<API.LoginStateType>({})
    const [submitting, setSubmitting] = useState(false)

    const { refresh } = useModel('@@initialState')
    const [autoLogin, setAutoLogin] = useState(true)
    const [type, setType] = useState<string>('account')

    const handleSubmit = async (values: LoginParamsType) => {
        setSubmitting(true)
        try {
            // 登录
            const msg = await accountLogin({ ...values, type })

            if (msg.code === 'ok') {
                message.success('登录成功！')
                replaceGoto()
                setTimeout(() => {
                    refresh()
                }, 0)
                return
            }
            // 如果失败去设置用户错误信息
            setUserLoginState(msg)
        } catch (error) {
            console.log(error)
            message.error('登录失败，请重试！')
        }
        setSubmitting(false)
    }

    const { code, type: loginType } = userLoginState

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.top}>
                    <div className={styles.header}>
                        <Link to="/">
                            <img alt="logo" className={styles.logo} src="/img/logo.png" />
                            <span className={styles.title}>CloudBase CMS</span>
                        </Link>
                    </div>
                    <div className={styles.desc}>打造云端一体化运营平台</div>
                </div>

                <div className={styles.main}>
                    <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
                        <Tab key="account" tab="账户密码登录">
                            {status === 'error' && loginType === 'account' && !submitting && (
                                <LoginMessage content="账户或密码错误" />
                            )}

                            <Username
                                name="username"
                                placeholder="用户名: admin or user"
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
                        <div>
                            <Checkbox
                                checked={autoLogin}
                                onChange={(e) => setAutoLogin(e.target.checked)}
                            >
                                自动登录
                            </Checkbox>
                            <a
                                style={{
                                    float: 'right',
                                }}
                            >
                                忘记密码
                            </a>
                        </div>
                        <Submit loading={submitting}>登录</Submit>
                        <div className={styles.other}>
                            {/* 其他登录方式 */}
                            <Link className={styles.register} to="/user/register">
                                注册账户
                            </Link>
                        </div>
                    </LoginFrom>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Login
