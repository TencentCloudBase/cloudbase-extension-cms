import { Injectable } from '@nestjs/common'
import { CloudBase } from '@cloudbase/node-sdk/lib/cloudbase'
import { CollectionReference } from '@cloudbase/database'
import { getCloudBaseApp } from '@/utils'

@Injectable()
export class CloudBaseService {
  app: CloudBase

  constructor() {
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
