import { RecordNotExistException } from '@/common'
import { Collection } from '@/constants'
import { CloudBaseService } from '@/services'
import { getCollectionSchema } from '@/utils'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UtilService {
  constructor(private readonly cloudbaseService: CloudBaseService) {}

  // 根据 collectionName 查询 collection 信息
  async getCollectionInfo(body: any) {
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
