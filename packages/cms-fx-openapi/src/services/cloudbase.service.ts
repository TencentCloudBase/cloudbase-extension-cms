import { Injectable } from '@nestjs/common'
import { CloudBase } from '@cloudbase/node-sdk'
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

  collection(collection: string) {
    return this.app.database().collection(collection)
  }

  auth() {
    return this.app.auth()
  }
}
