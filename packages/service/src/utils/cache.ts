/**
 * 内存缓存
 */
export class MemoryCache {
  cache: Map<string, any>

  constructor() {
    this.cache = new Map()
  }

  public set(key: string, value: any) {
    this.cache.set(key, value)
  }

  public get(key: string): any {
    return this.cache.get(key)
  }

  public del(key: string) {
    this.cache.delete(key)
  }
}
