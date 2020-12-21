import { Collection } from '@/constants'
import { getCloudBaseApp } from '@/utils'
import { Injectable } from '@nestjs/common'
import { LocalCacheService } from './cache.service'

/**
 * 请求级缓存 schema
 */
@Injectable()
export class SchemaCacheService {
  constructor(private readonly cacheService: LocalCacheService) {}

  getCollectionSchema(collection: string): Promise<Schema>
  getCollectionSchema(): Promise<Schema[]>

  async getCollectionSchema(collection?: string) {
    const { cacheService } = this

    // 全部 schemas 使用 SCHEMAS 作为 key 缓存
    const cacheSchema = collection ? cacheService.get(collection) : cacheService.get('SCHEMAS')
    if (cacheSchema) return cacheSchema

    const app = getCloudBaseApp()

    const query = collection
      ? {
          collectionName: collection,
        }
      : {}

    const { data }: { data: Schema[] } = await app
      .database()
      .collection(Collection.Schemas)
      .where(query)
      .limit(1000)
      .get()

    if (collection) {
      cacheService.set(collection, data[0])
    } else {
      cacheService.set('SCHEMAS', data)
    }

    return collection ? data[0] : data
  }
}
