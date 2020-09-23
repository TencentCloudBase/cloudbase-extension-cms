import { IActionCtx } from 'concent'
import { getSchemas } from '@/services/schema'

interface SchemaState {
  currentSchema: SchemaV2
  loading: boolean
  schemas: SchemaV2[]
  fieldAction: 'create' | 'edit'
  selectedField: {
    type: string
    name: string
    icon: React.ReactNode
    desc: string
  } & SchemaFieldV2
}

const state: SchemaState = {
  currentSchema: {} as any,
  loading: false,
  schemas: [],
  fieldAction: 'create',
  selectedField: {} as any,
}

export default {
  state,
  reducer: {
    async getSchemas(projectId: string, state: SchemaState, ctx: IActionCtx) {
      ctx.setState({
        loading: true,
      })

      try {
        const { data } = await getSchemas(projectId)
        const { currentSchema } = state
        if (!currentSchema) return

        // 重新获取时，如果存在选择的 schema，则也同时更新
        if (currentSchema?._id) {
          let schema = data.find((_: any) => _._id === currentSchema._id)

          if (!schema?._id) {
            schema = data[0]
          }

          return {
            schemas: data,
            // 为空时置 schema 为空
            currentSchema: schema || {},
            loading: false,
          }
        }

        return {
          currentSchema: data?.[0]?._id ? data[0] : {},
          schemas: data,
          loading: false,
        }
      } catch (error) {
        console.log(error)
        return {
          loading: false,
        }
      }
    },
  },
}
