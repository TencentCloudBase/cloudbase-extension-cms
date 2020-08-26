import { Method } from 'axios'
import { SchemaV2 } from '../schemas/types'

export interface Webhook {
  _id: string

  name: string

  url: string

  method: Method

  event: string[]

  collections: SchemaV2[]

  headers: { key: string; value: string }[]
}
