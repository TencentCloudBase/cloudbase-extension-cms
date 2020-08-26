import { IActionCtx } from 'concent'
import { getContentSchemas } from '@/services/content'

export default {
  state: {
    schemas: [],
    loading: false,
    // create 或 edit
    contentAction: 'create',
    selectedContent: {},
  },
  reducer: {
    async getContentSchemas(projectId: string, state: any, ctx: IActionCtx) {
      ctx.setState({
        loading: true,
      })

      try {
        const { data } = await getContentSchemas(projectId)

        return {
          schemas: data,
          loading: false,
        }
      } catch (error) {
        console.log(error)
        return {
          schemas: [],
          loading: false,
        }
      }
    },
  },
}
