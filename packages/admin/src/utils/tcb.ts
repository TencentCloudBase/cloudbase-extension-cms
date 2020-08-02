let app: any

export async function getCloudBaseApp() {
    if (!app) {
        const { envId } = window.TcbCmsConfig || {}
        app = window.tcb.init({
            env: envId
        })
        await app
            .auth({
                persistence: 'local'
            })
            .anonymousAuthProvider()
            .signIn()
    }
    return app
}

export async function uploadFile(file: File): Promise<string> {
    const app = await getCloudBaseApp()

    const result = await app.uploadFile({
        cloudPath: `tcb-cms-upload/${Date.now()}.${file.name.split('.').slice(-1)[0]}`,
        filePath: file
    })

    return result.fileID
}

export async function getTempFileURL(cloudId: string): Promise<string> {
    const app = await getCloudBaseApp()
    const result = await app.getTempFileURL({
        fileList: [cloudId]
    })
    return result.fileList[0].tempFileURL
}
