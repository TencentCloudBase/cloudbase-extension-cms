import { Injectable, Inject } from '@nestjs/common'
import { CloudBase } from '@cloudbase/node-sdk/lib/cloudbase'
import { CollectionReference } from '@cloudbase/database'
import { CloudBaseConfig } from './types'
import { getCloudBaseApp } from '@/utils'

@Injectable()
export class CloudBaseService {
  app: CloudBase

  constructor(@Inject('CLOUDBASE_CONFIG') config: CloudBaseConfig) {
    this.app = getCloudBaseApp()
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
