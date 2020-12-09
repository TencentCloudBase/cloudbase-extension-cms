import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { RecordNotExistException } from './common'
import { getCollectionSchema } from './utils'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello()
  }

  // 根据 collectionName 查询 collection 信息
  @Post('collectionInfo')
  async getCollectionInfo(@Body() body) {
    const { collectionName } = body
    const schema = await getCollectionSchema(collectionName)

    if (!schema) {
      throw new RecordNotExistException('数据集合不存在')
    }

    return {
      data: schema,
    }
  }
}
