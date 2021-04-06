import { getSetting, updateSetting } from '@/services/global'
import { getCloudBaseApp } from '@/utils'

interface GlobalState {
  /**
   * 当前项目信息
   */
  currentProject?: Project

  /**
   * 设置
   */
  setting: GlobalSetting
}

const state: GlobalState = {
  currentProject: undefined,

  setting: {},
}

export default {
  state,
  reducer: {
    // 重新获取设置信息
    async getSetting() {
      const { data } = await getSetting()
      return {
        setting: data,
      }
    },
    // 更新设置信息
    async updateSetting(setting: GlobalSetting, state: GlobalState) {
      await updateSetting(setting)

      return {
        setting: {
          ...state.setting,
          ...setting,
        },
      }
    },
  },
  init: async () => {
    try {
      // 校验是否登录
      const app = await getCloudBaseApp()
      const loginState = await app.auth({ persistence: 'local' }).getLoginState()
      if (!loginState) return {}

      // 获取全局设置
      const { data = {} } = await getSetting()

      return {
        setting: data,
      }
    } catch (error) {
      console.log(error)
      return {}
    }
  },
}
