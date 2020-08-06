import { IActionCtx } from 'concent'
import { getSchemas } from '@/services/schema'

export default {
    state: {
        projectId: '',
        contents: [],
        loading: false,
        currentSchema: null,
        // create 或 edit
        contentAction: 'create',
        selectedContent: {}
    },
    reducer: {
        async getSchemas(projectId: string, state: SchemaState, ctx: IActionCtx) {
            ctx.setState({
                loading: true
            })
            const { data } = await getSchemas(projectId)
            const { currentSchema } = state

            // 重新获取时，如果存在选择的 schema，则也同时更新
            if (currentSchema) {
                const schema = data.find((_: any) => _._id === currentSchema._id) || {}
                return {
                    projectId,
                    schemas: data,
                    currentSchema: schema,
                    loading: false
                }
            }

            return {
                projectId,
                schemas: data,
                loading: false
            }
        }
    }
}
