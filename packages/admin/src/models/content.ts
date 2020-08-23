import { IActionCtx } from 'concent'
import { getContentSchemas } from '@/services/content'

export default {
  state: {
    schemas: [],
    loading: false,
    contentLoading: false,
    currentSchema: null,
    // create 或 edit
    contentAction: 'create',
    selectedContent: {},
  },
  reducer: {
    async getContentSchemas(projectId: string, state: any, ctx: IActionCtx) {
      ctx.setState({
        loading: true,
      })

      const { data } = await getContentSchemas(projectId)
      const { currentSchema } = state

      // 重新获取时，如果存在选择的 schema，则也同时更新
      if (currentSchema) {
        const schema = data.find((_: any) => _._id === currentSchema._id) || {}
        return {
          schemas: data,
          currentSchema: schema,
          loading: false,
        }
      }

      console.log(data)

      return {
        // currentSchema: data?.length ? data[0] : null,
        schemas: data,
        loading: false,
      }
    },
  },
}
