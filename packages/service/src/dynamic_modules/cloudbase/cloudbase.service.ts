import { Injectable, Inject } from '@nestjs/common'
import cloudbase from '@cloudbase/node-sdk'
import { CloudBase } from '@cloudbase/node-sdk/lib/cloudbase'
import { CollectionReference } from '@cloudbase/database'
import { CloudBaseConfig } from './types'

@Injectable()
export class CloudBaseService {
    app: CloudBase

    constructor(@Inject('CLOUDBASE_CONFIG') config: CloudBaseConfig) {
        const { envId, secretId, secretKey } = config
        this.app = cloudbase.init({
            secretId,
            secretKey,
            env: envId,
        })
    }

    get db() {
        return this.app.database()
    }

    collection(collection: string): CollectionReference {
        return this.app.database().collection(collection)
    }

    auth() {
        return this.app.auth()
    }
}
