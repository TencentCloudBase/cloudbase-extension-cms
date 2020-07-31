import { Injectable } from '@nestjs/common'
import CloudBase from '@cloudbase/manager-node'
import { getEnvIdString } from '@/utils'
import { CollectionV1, CollectionV2 } from '@/constants'

@Injectable()
export class SchemaService {
    getSchemaColl(version: string) {
        return version === '2.0' ? CollectionV2.Schemas : CollectionV1.Schemas
    }

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
