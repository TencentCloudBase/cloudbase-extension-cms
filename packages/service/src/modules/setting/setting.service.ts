import { Injectable } from '@nestjs/common'
import extract from 'extract-zip'
import { getCloudBaseApp, getCloudBaseManager } from '@/utils'

@Injectable()
export class SettingService {
  /**
   * 下载、解压微应用文件，并上传到静态网站托管
   */
  async unzipAndUploadFiles(appID: string, fileID: string) {
    const app = await getCloudBaseApp()
    const manager = await getCloudBaseManager()

    const tempFilePath = '/tmp/microApp.zip'

    // 下载文件
    await app.downloadFile({
      fileID,
      tempFilePath,
    })

    // 解压文件
    const dir = '/tmp/microAppFiles'
    await extract(tempFilePath, {
      dir,
    })

    // 上传文件到静态托管
    await manager.hosting.uploadFiles({
      localPath: dir,
      cloudPath: `cloudbase-cms/apps/${appID}`,
    })
  }
}
