import { Injectable, Scope } from '@nestjs/common'

interface KV {
  [key: string]: any
  [key: number]: any
}

interface CacheMap extends KV {
  // 模型数据
  schemas: Schema[]

  // 关联遍历的集合名
  connectTraverseCollections: string[]
}

// 针对单个请求的缓存
@Injectable({
  scope: Scope.REQUEST,
})
export class LocalCacheService {
  private readonly cache: Map<string | number, any>

  constructor() {
    this.cache = new Map()
  }

  public set<T extends keyof CacheMap>(key: keyof CacheMap, value: CacheMap[T]) {
    this.cache.set(key, value)
  }

  public get<T extends keyof CacheMap>(key: T): CacheMap[T] {
    return this.cache.get(key)
  }
}
