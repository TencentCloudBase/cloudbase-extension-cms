import { Method } from 'axios'
import { Schema } from '../schemas/types'

export interface Webhook {
  _id: string

  name: string

  url: string

  method: Method

  event: string[]

  collections: Schema[]

  headers: { key: string; value: string }[]
}
