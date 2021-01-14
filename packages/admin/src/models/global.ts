import { getSettings, updateSetting } from '@/services/global'

export interface SettingState {
  miniappID?: string
  miniappName?: string
  miniappOriginalID?: string
  enableOperation?: boolean
}

interface GlobalState {
  setting: SettingState | null
}

const state: GlobalState = {
  setting: null,
}

export default {
  state,
  reducer: {
    // 更新设置信息
    async updateSetting(setting: any, state: GlobalState) {
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
      const { data = {} } = await getSettings()
      return {
        setting: data,
      }
    } catch (error) {
      console.log(error)
      return {}
    }
  },
}
