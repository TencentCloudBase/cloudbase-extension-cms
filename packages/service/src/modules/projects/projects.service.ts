import { RecordExistException } from '@/common'
import { Functions } from '@/constants'
import { getCloudBaseManager, isRunInContainer, isRunInServerMode } from '@/utils'
import { Injectable } from '@nestjs/common'

@Injectable()
export class ProjectsService {
  async deleteApiAccessPath(path: string) {
    const manager = await getCloudBaseManager()
    // 查询 apiId
    const {
      APISet: [accessPath],
    } = await manager.access.getAccessList({
      path,
    })

    // API 可能已被删除
    if (!accessPath) return

    // 根据 apiId 删除
    await manager.access.deleteAccess({
      apiId: accessPath.APIId,
    })
  }

  async createApiAccessPath(path: string) {
    const manager = await getCloudBaseManager()

    // 查询 path 是否已经绑定了其他的云函数/云托管服务
    const {
      APISet: [accessPath],
    } = await manager.access.getAccessList({
      path,
    })

    if (accessPath && accessPath.Name !== Functions.API) {
      throw new RecordExistException('此路径已被其他服务绑定，请更换路径后重试')
    }

    // 路径未被占用
    try {
      await manager.access.createAccess({
        path,
        name: Functions.API,
      })
    } catch (e) {
      if (e.code === 'InvalidParameter.APICreated') {
        // ignore
      } else {
        throw e
      }
    }
  }
}
