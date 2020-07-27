import { getApp } from './tcbProvider'
import { getConfig } from './configProvider'

let auth

const TcbAuthProvider = {
  // 登录
  async login({ username, password }) {
    const config = await getConfig()
    const auth = await this.getAuthObj()

    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        userName: username.trim(),
        password: password.trim()
      }),
      redirect: 'follow'
    }

    // 初始化时写入
    const loginRes = await fetch(
      `//${config.envId}.service.tcloudbase.com/tcb-ext-cms-service/login`,
      requestOptions
    ).then((response) => response.json())

    if (!loginRes.code) {
      localStorage.setItem('tcb-cms-role', loginRes.data.role)
      return auth.signInWithTicket(loginRes.data.ticket)
    } else {
      return Promise.reject(loginRes.message)
    }
  },
  // 退出登录
  async logout() {
    const auth = await this.getAuthObj()
    return auth.signOut().then(console.log)
  },
  // 异常
  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      return Promise.reject()
    }
    return Promise.resolve()
  },
  // 校验授权
  async checkAuth() {
    const auth = await this.getAuthObj()
    const loginState = await auth.getLoginState()

    if (!loginState) {
      throw new Error('未登录，请先登录后再进行操作')
    }
  },
  // 导航时，检查权限
  getPermissions: (...rest) => {
    const role = localStorage.getItem('tcb-cms-role')
    return role ? Promise.resolve(role) : Promise.reject()
  },

  async getAuthObj() {
    if (!auth) {
      const app = await getApp()
      auth = app.auth({ persistence: 'local' })
    }
    return auth
  }
}

export default TcbAuthProvider
