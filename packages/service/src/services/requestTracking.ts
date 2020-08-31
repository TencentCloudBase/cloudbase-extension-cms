import { Injectable, Scope } from '@nestjs/common'
import { nanoid } from '@/utils'

@Injectable({ scope: Scope.REQUEST })
export class RequestTracking {
  public seqId: string
  public requestStartTime: number

  constructor() {
    this.seqId = nanoid()
    this.requestStartTime = Date.now()
  }

  getBaseInfo() {
    return {
      ...this,
      requestTimeCost: Date.now() - this.requestStartTime,
    }
  }
}
