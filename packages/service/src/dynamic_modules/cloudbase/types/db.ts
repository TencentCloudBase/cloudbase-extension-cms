import { extend } from 'dayjs'

// declare a universal database schema which is object
export interface Data {
  [key: string]: any
}

export type BaseType = string | number | boolean | null | undefined

export type Enumerable<T> = T | Array<T>

// query filters like mongo operators
export interface WhereFilter {
  equals?: BaseType
  not?: BaseType
  in?: Enumerable<BaseType>
  notIn?: Enumerable<BaseType>
  lt?: number
  lte?: number
  gt?: number
  gte?: number
}

export type CreateReturn<T extends Data> = {
  [key in keyof T]: T[key]
}

export type Subset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never
}

export type WhereInput<T> = {
  [key in keyof T]: any
}

export type KeyStringOf<T> = Extract<keyof T, string>

export interface SelectOptions<Post> {
  // Specifies which properties to include on the returned object
  select?: KeyStringOf<Post>[]

  // Specifies which properties to exclude on the returned object
  exclude?: KeyStringOf<Post>[]
}

export interface FilterOptions<Post> extends SelectOptions<Post> {
  //
  limit?: number | null
  //
  skip?: number | null
  //
  orderBy?: {
    [key in keyof Post]: 'asc' | 'desc'
  }
}

export type SavePost<Post> =
  | {
      id: string
    }
  | ({ id: string } & Partial<Post>)

//
export interface ActionResult<Post> {
  count: number
  data?: Post[]
}

export interface Database {
  /**
   * declare database type
   */
  type: 'cloudbase'

  /**
   * find one record by where condition from database
   */
  findOne: <Post extends Data>(where: Partial<Post>, options?: SelectOptions<Post>) => Promise<Post>

  /**
   * get many records by where condition from database
   */
  findMany: <Post extends Data>(
    where?: Partial<Post>,
    options?: FilterOptions<Post>
  ) => Promise<{
    data: Post[]
    count?: number
  }>

  /**
   * insert one record into database
   */
  createOne: <Post extends Data>(post: Post) => Promise<SavePost<Post>>

  /**
   * batch insert records into database
   */
  createMany: <Post extends Data>(posts: Post[]) => Promise<ActionResult<Post>>

  /**
   * update one record first match where condition
   */
  updateOne: <Post extends Data>(
    where: Partial<Post>,
    post: Partial<Post>
  ) => Promise<ActionResult<Post>>

  /**
   * update many records value by  where condition
   */
  updateMany: <Post extends Data>(
    where: Partial<Post>,
    post: Partial<Post>
  ) => Promise<ActionResult<Post>>

  /**
   * delete one record first match where condition
   */
  deleteOne: <Post extends Data>(where: Partial<Post>) => Promise<ActionResult<Post>>

  /**
   * delete many records by where condition
   */
  deleteMany: <Post extends Data>(where: Partial<Post>) => Promise<ActionResult<Post>>

  /**
   * count records match where condition
   */
  count: <Post extends Data>(where: Partial<Post>) => Promise<ActionResult<Post>>
}
