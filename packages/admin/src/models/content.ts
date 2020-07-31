import { IFnCtx, IActionCtx } from 'concent'

export default {
    state: {
        projectId: '',
        contents: [],
        loading: false
    },
    reducer: {},
    watch: {
        currentSchema: async (newSate: any, state: any, ctx: IFnCtx) => {
            // ctx
        }
    }
}
