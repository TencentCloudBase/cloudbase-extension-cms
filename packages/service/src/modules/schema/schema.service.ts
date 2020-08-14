import { Injectable, UnauthorizedException } from '@nestjs/common'
import CloudBase from '@cloudbase/manager-node'
import { getEnvIdString } from '@/utils'

@Injectable()
export class SchemaService {
    // 创建集合
    async createCollection(name: string) {
        const envId = getEnvIdString()
        const manager = CloudBase.init({
            envId,
            secretId: process.env.SECRETID,
            secretKey: process.env.SECRETKEY,
        })

        try {
            await manager.database.createCollectionIfNotExists(name)
        } catch (e) {
            return e.code
        }
    }

    // 删除集合
    async deleteCollection(name: string) {
        const envId = getEnvIdString()
        const manager = CloudBase.init({
            envId,
            secretId: process.env.SECRETID,
            secretKey: process.env.SECRETKEY,
        })

        try {
            await manager.database.deleteCollection(name)
        } catch (e) {
            return e.code
        }
    }
}
