import Util from 'util'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/services'
import { getCloudBaseManager, randomId } from '@/utils'
import { getCosApp } from '@/utils/cos'

// 本地时间
dayjs.locale('zh-cn')

// 转换成前端接受的格式
const dataFormat = (data) => {
  return {
    msg: '上传成功',
    code: 0,
    data: {
      errFiles: [],
      succMap: data,
    },
  }
}

@Injectable()
export class FileService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  // 上传文件
  async upload(file: IFile) {
    // 按照日期分类
    const day = dayjs().format('YYYY-MM-DD')
    // 文件名
    let ext
    if (file.originalname?.length && file.originalname.includes('.')) {
      ext = file.originalname.split('.').pop()
      ext = `.${ext}`
    } else {
      ext = file.originalname
    }

    // 文件路径
    const cloudPath = `cloudbase-cms/upload/${day}/${randomId()}_${ext}`
    // 上传文件
    const { fileID } = await this.cloudbaseService.app.uploadFile({
      cloudPath,
      fileContent: file.buffer,
    })
    return {
      fileName: file.originalname,
      fileID,
    }
  }

  // 获取文件访问链接
  async getUrl(files) {
    const ids = files.map((file) => {
      return file.fileID
    })
    const { fileList } = await this.cloudbaseService.app.getTempFileURL({
      fileList: ids,
    })

    // 转换成 { filename: url } 的格式
    const data = fileList.reduce((prev, curr, index) => {
      const { fileName } = files[index]
      prev[String(fileName)] = curr.tempFileURL
      return prev
    }, {})
    return dataFormat(data)
  }

  /**
   * 上传文件到静态网站托管
   */
  async uploadFileToHosting(file: IFile, filePath: string) {
    // 使用 COS SDK 上传文件到静态网站托管
    const managerApp = await getCloudBaseManager()
    const cos = await getCosApp()
    const putObject = Util.promisify(cos.putObject).bind(cos)
    const hosting = await managerApp.hosting.getInfo()
    const { Bucket, Regoin, CdnDomain } = hosting[0]

    // 上传文件
    await putObject({
      Bucket,
      Region: Regoin,
      Key: filePath,
      StorageClass: 'STANDARD',
      ContentLength: file.size,
      Body: file.buffer,
    })

    return {
      url: `https://${CdnDomain}/${filePath}`,
    }
  }
}
