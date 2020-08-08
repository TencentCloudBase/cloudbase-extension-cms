let app: any

export async function getCloudBaseApp() {
    if (!app) {
        const { envId } = window.TcbCmsConfig || {}
        app = window.tcb.init({
            env: envId,
        })

        // 登陆
        // await app
        //     .auth({
        //         persistence: 'local',
        //     })
        //     .anonymousAuthProvider()
        //     .signIn()
    }
    return app
}

export async function uploadFile(file: File, onProgress: (v: number) => void): Promise<string> {
    const app = await getCloudBaseApp()

    const result = await app.uploadFile({
        cloudPath: `upload/${Date.now()}.${file.name.split('.').slice(-1)[0]}`,
        filePath: file,
        onUploadProgress: (progressEvent: ProgressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
        },
    })

    return result.fileID
}

export async function getTempFileURL(cloudId: string): Promise<string> {
    const app = await getCloudBaseApp()
    const result = await app.getTempFileURL({
        fileList: [cloudId],
    })
    return result.fileList[0].tempFileURL
}
