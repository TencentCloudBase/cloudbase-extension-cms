import { Injectable } from '@nestjs/common'
import { getCloudBaseManager } from '@/utils'

@Injectable()
export class SchemasService {
  // 创建集合
  async createCollection(name: string) {
    const manager = await getCloudBaseManager()

    try {
      const res = await manager.database.createCollectionIfNotExists(name)

      // 集合创建失败
      if (!res?.IsCreated && !res.ExistsResult?.Exists) {
        return `Create Collection Fail: ${res.RequestId}`
      }
    } catch (e) {
      console.error(e)
      return e.code
    }
  }

  // 删除集合
  async deleteCollection(name: string) {
    const manager = await getCloudBaseManager()

    try {
      await manager.database.deleteCollection(name)
    } catch (e) {
      return e.code
    }
  }

  // 重命名集合
  async renameCollection(oldName: string, newName: string) {
    const manager = await getCloudBaseManager()

    try {
      // 获取数据库实例ID
      const { EnvInfo } = await manager.env.getEnvInfo()
      const { Databases } = EnvInfo

      await manager.commonService('flexdb').call({
        Action: 'ModifyNameSpace',
        Param: {
          Tag: Databases[0].InstanceId,
          ModifyTableInfo: [
            {
              OldTableName: oldName,
              NewTableName: newName,
            },
          ],
        },
      })
    } catch (e) {
      return e.code
    }
  }
}
