import { CloudApiService } from '@cloudbase/cloud-api'
import { getCredential } from './env'

/**
 * 获取低码应用已发布页面列表
 */
export const getLowCodeAppInfo = async (appId: string) => {
  const credential = getCredential()
  const apiService = new CloudApiService({
    credential,
    service: 'lowcode',
  })

  try {
    const res = await apiService.request('ListAppPages', {
      projectId: appId,
    })
    return res
  } catch (error) {
    console.log(error)
    return {
      data: {
        pages: [],
      },
    }
  }
}
