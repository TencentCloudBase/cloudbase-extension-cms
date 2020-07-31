// import cloudbase from '@cloudbase/node-sdk'
// import { Db, CollectionReference } from '@cloudbase/database'
// import { Database, Data, SelectOptions, FilterOptions, CloudBaseConfig } from '../types'

// export class CloudBaseDatabase implements Database {
//     type: 'cloudbase'
//     dbRef: Db
//     collRef: CollectionReference

//     constructor(config: CloudBaseConfig) {
//         const { envId, secretId, secretKey } = config
//         const app = cloudbase.init({
//             secretId,
//             secretKey,
//             env: envId
//         })
//         const db = app.database()
//         this.dbRef = db
//     }

//     collection(collection: string) {
//         this.collRef = this.dbRef.collection(collection)
//         return this
//     }

//     /**
//      * find one record by where condition from database
//      */
//     async findOne<Post extends Data>(where: Partial<Post>, options: SelectOptions<Post> = {}) {
//         const { select = [], exclude = [] } = options
//         const field = {}

//         select.forEach((key) => {
//             field[key as string] = true
//         })

//         exclude.forEach((key) => {
//             field[key as string] = false
//         })

//         const posts: {
//             data: any[]
//             requestId: string
//             total: number
//             limit: number
//             offset: number
//         } = await this.collRef.where(where).field(field).limit(1).get()

//         return posts.data?.[0] || null
//     }

//     /**
//      * get many records by where condition from database
//      */
//     async findMany<Post extends Data>(where?: Partial<Post>, options: FilterOptions<Post> = {}) {
//         const { select = [], exclude = [], limit = 10, skip = 0, orderBy = {} } = options
//         const field = {}

//         select.forEach((key) => {
//             field[key as string] = true
//         })

//         exclude.forEach((key) => {
//             field[key as string] = false
//         })

//         const orderByKey = Object.keys(orderBy)?.[0]
//         const orderByDirection = orderByKey ? orderBy[orderByKey] : undefined

//         const find = this.collRef.where(where).field(field).limit(limit).skip(skip)
//         let res: {
//             data: Post[]
//             requestId: string
//             total: number
//             limit: number
//             offset: number
//         }

//         if (!orderByKey) {
//             res = await find.get()
//         } else {
//             res = await find.orderBy(orderByKey, orderByDirection).get()
//         }

//         return {
//             data: res.data,
//             count: res.total
//         }
//     }

//     /**
//      * insert one record into database
//      */
//     async createOne<Post extends Data>(post: Post) {
//         if (post.id) {
//             throw new Error('id is a reserved field')
//         }

//         // create an id
//         const id = nanoid()
//         await this.collRef.add({
//             id,
//             ...post
//         })

//         return {
//             id
//         }
//     }

//     /**
//      * batch insert records into database
//      */
//     async createMany<Post extends Data>(posts: Post[]) {
//         const res: {
//             ids?: string[]
//             inserted?: number
//             ok?: number
//             requestId: string
//         } = await this.collRef.add(posts)

//         return {
//             count: res.inserted
//         }
//     }

//     /**
//      * update one record first match where condition
//      */
//     async updateOne<Post extends Data>(where: Partial<Post>, post: Partial<Post>) {
//         const doc = await this.findOne(where)
//         if (!doc) {
//             return {
//                 count: 0
//             }
//         }

//         const res: {
//             updated: number
//             requestId: string
//         } = await this.collRef.doc(doc._id).update(post)

//         return {
//             count: res.updated
//         }
//     }

//     /**
//      * update many records value by where condition
//      */
//     async updateMany<Post extends Data>(where: Partial<Post>, post: Partial<Post>) {
//         const res: {
//             updated: number
//             requestId: string
//         } = await this.collRef.where(where).update(post)

//         return {
//             count: res.updated
//         }
//     }

//     /**
//      * delete one record first match where condition
//      */
//     async deleteOne<Post extends Data>(where: Partial<Post>) {
//         const doc = await this.findOne(where)
//         if (!doc) {
//             return {
//                 count: 0
//             }
//         }

//         const res: {
//             deleted: number
//             requestId: string
//         } = await this.collRef.doc(doc).remove()

//         return {
//             count: res.deleted
//         }
//     }

//     /**
//      * delete many records by where condition
//      */
//     async deleteMany<Post extends Data>(where: Partial<Post>) {
//         const res: {
//             deleted: number
//             requestId: string
//         } = await this.collRef.where(where).remove()

//         return {
//             count: res.deleted
//         }
//     }

//     /**
//      * count records match where condition
//      */
//     async count<Post extends Data>(where: Partial<Post>) {
//         const res: {
//             total: number
//             requestId: string
//         } = await this.collRef.where(where).count()

//         return {
//             count: res.total
//         }
//     }
// }
