import { IActionCtx } from 'concent'
import { getContentSchemas } from '@/services/content'

interface ContentState {
  schemas: Schema[]
  loading: boolean
  contentAction: 'create' | 'edit'
  selectedContent: any
  searchFields: any[]
  searchParams: any
  currentSchema: any
}

const state: ContentState = {
  schemas: [],
  loading: false,
  // create 或 edit
  contentAction: 'create',
  selectedContent: {},
  // 保存搜索条件
  searchFields: [],
  searchParams: {},
  currentSchema: {},
}

export default {
  state,
  reducer: {
    addSearchField(field: any, state: ContentState) {
      const { searchFields } = state
      return {
        searchFields: searchFields.concat(field),
      }
    },
    removeSearchField(field: any, state: ContentState) {
      const { searchFields } = state
      const index = searchFields.findIndex((_) => _.id === field.id)
      searchFields.splice(index, 1)
      return {
        searchFields,
      }
    },
    clearSearchField() {
      return {
        searchFields: [],
      }
    },
    setSearchFields(fields: any[], state: ContentState) {
      return {
        searchFields: fields,
      }
    },
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
