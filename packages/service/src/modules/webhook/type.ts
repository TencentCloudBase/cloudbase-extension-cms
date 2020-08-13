import { SchemaV2 } from '../schema/types'

export interface Webhook {
    _id: string

    name: string

    url: string

    method: string

    event: string[]

    collections: SchemaV2[]

    triggerType: string | 'all'

    headers: { [key: string]: string }[]
}
