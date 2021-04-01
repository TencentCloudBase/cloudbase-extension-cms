import { IActionCtx } from 'concent'
import { getSchemas } from '@/services/schema'

type Action = 'create' | 'edit' | 'copy'

interface SchemaState {
  currentSchema: Schema
  loading: boolean
  schemas: Schema[]
  // 编辑模型的弹窗
  schemaEditVisible: boolean
  schemaEditAction: Action

  fieldAction: 'create' | 'edit'
  // 选择编辑的字段
  selectedField: {
    type?: string
    name?: string
    icon?: React.ReactNode
    desc?: string
  } & SchemaField
  selectedFieldIndex: number
  // 删除字段弹窗
  deleteFieldVisible: boolean
  // 编辑字段弹窗
  editFieldVisible: boolean
}

const state: SchemaState = {
  currentSchema: {} as any,
  loading: false,
  schemas: [],
  schemaEditVisible: false,
  schemaEditAction: 'create',
  fieldAction: 'create',
  selectedField: {} as any,
  deleteFieldVisible: false,
  editFieldVisible: false,
  selectedFieldIndex: -1,
}

export default {
  state,
  reducer: {
    copySchema() {
      return {
        schemaEditAction: 'copy',
        schemaEditVisible: true,
      }
    },
    createSchema() {
      return {
        schemaEditAction: 'create',
        schemaEditVisible: true,
      }
    },
    editSchema() {
      return {
        schemaEditAction: 'edit',
        schemaEditVisible: true,
      }
    },
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
