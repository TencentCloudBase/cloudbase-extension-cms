import path from 'path'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { IFile } from './types'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules'
import 'dayjs/locale/zh-cn'

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
    // 上传文件
    const { fileID } = await this.cloudbaseService.app.uploadFile({
      cloudPath: `tcb-cms/${day}/${nanoid(32)}${path.extname(file.originalname)}`,
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
}
