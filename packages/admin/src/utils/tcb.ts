let app: any

export async function getApp() {
    if (!app) {
        const { envId } = window.TcbCmsConfig || {}
        app = window.tcb.init({
            env: envId
        })
    }
    return app
}

export async function getTempFileURL(cloudId: string): Promise<string> {
    const app = await getApp()
    const result = await app.getTempFileURL({
        fileList: [cloudId]
    })
    return result.fileList[0].tempFileURL
}
