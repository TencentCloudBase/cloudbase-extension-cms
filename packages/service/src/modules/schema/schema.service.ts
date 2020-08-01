import { Injectable } from '@nestjs/common'
import CloudBase from '@cloudbase/manager-node'
import { getEnvIdString } from '@/utils'

@Injectable()
export class SchemaService {
    async createCollection(name: string) {
        const envId = getEnvIdString()
        const manager = CloudBase.init({
            envId,
            secretId: process.env.SECRETID,
            secretKey: process.env.SECRETKEY
        })

        try {
            await manager.database.createCollection(name)
        } catch (e) {
            return e.code
        }
    }
}
