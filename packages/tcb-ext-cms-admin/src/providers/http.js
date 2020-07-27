import axios from 'axios'
import { getConfig } from './configProvider'

class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.maxPathLength = 50
  }

  // 默认配置
  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: {},
      timeout: 10000,
      withCredentials: true
    }
    return config
  }

  // 处理响应错误
  handleError(error) {
    console.log(error)
  }

  // 拦截
  interceptors(instance, url) {
    // 请求拦截
    instance.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )

    // 响应拦截
    instance.interceptors.response.use((res) => {
      const { data } = res
      return data
    })
  }

  request(options) {
    const instance = axios.create()
    // 合并选项
    const mergeOptions = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, mergeOptions.url)
    return instance(mergeOptions)
  }
}

// 异步获取配置，发送 HTTP 请求
export const httpRequest = async (options) => {
  const config = await getConfig()
  const instance = new HttpRequest(config.baseUrl)
  return instance.request(options)
}
