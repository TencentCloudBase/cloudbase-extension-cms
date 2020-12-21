import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { RecordNotExistException } from './common'
import { Collection } from './constants'
import { CloudBaseService } from './services'
import { getCollectionSchema } from './utils'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cloudbaseService: CloudBaseService
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello()
  }

  // 根据 collectionName 查询 collection 信息
  @Post('collectionInfo')
  async getCollectionInfo(@Body() body) {
    const { collectionName, customId } = body

    // 查询项目信息
    const {
      data: [project],
    } = await this.cloudbaseService
      .collection(Collection.Projects)
      .where({
        customId,
      })
      .get()

    let schema

    // 如果有 collectionName，也查询集合信息
    if (collectionName) {
      schema = await getCollectionSchema(collectionName)
      if (!schema) {
        throw new RecordNotExistException('数据集合不存在')
      }
    }

    return {
      data: {
        project,
        schema,
      },
    }
  }
}
