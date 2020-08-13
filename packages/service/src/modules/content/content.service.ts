import _ from 'lodash'
import { Injectable } from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules/cloudbase'

@Injectable()
export class ContentService {
    constructor(private cloudbaseService: CloudBaseService) {}

    async getMany(
        resource: string,
        options: {
            filter?: {
                ids?: string[]
                [key: string]: any
            }
            fuzzyFilter?: {
                [key: string]: string
            }
            pageSize?: number
            page?: number
            sort?: {
                [key: string]: 'ascend' | 'ascend'
            }
        }
    ) {
        const { filter = {}, fuzzyFilter, page = 1, pageSize = 20, sort } = options
        const db = this.cloudbaseService.db
        const collection = this.cloudbaseService.collection(resource)

        // 删除 ids 字段
        const where = _.omit(filter, 'ids')
        // 支持批量查询
        if (filter?.ids?.length) {
            where._id = db.command.in(filter.ids)
        }

        if (fuzzyFilter) {
            Object.keys(fuzzyFilter).forEach((key) => {
                where[key] = db.RegExp({
                    options: 'ig',
                    regexp: fuzzyFilter[key],
                })
            })
        }

        let query = collection.where(where)
        // 获取总数
        const countRes = await query.count()
        // 查询
        query = query.skip(Number(page - 1) * Number(pageSize)).limit(pageSize)

        if (sort) {
            Object.keys(sort).forEach((key: string) => {
                const direction = sort[key] === 'ascend' ? 'asc' : 'desc'
                query.orderBy(key, direction)
            })
        }

        const res = await query.get()

        return { ...res, total: countRes.total }
    }

    async getOne(resource: string, options: { filter: { _id?: string } }) {
        const { filter = {} } = options
        const collection = this.cloudbaseService.collection(resource)

        let query = collection.where(filter)

        return query.limit(1).get() as any
    }

    async updateOne(
        resource: string,
        options: { filter: { _id?: string }; payload: Record<string, any> }
    ) {
        const { filter = {}, payload } = options
        const collection = this.cloudbaseService.collection(resource)

        // 查询一个
        let { data } = await collection.where(filter).limit(1).get()

        if (!data?.length) {
            return {}
        }

        const updateData = _.omit(payload, '_id')
        return collection.doc(data[0]._id).update(updateData)
    }

    async updateMany(
        resource: string,
        options: {
            filter: { ids?: string[] }
            payload: Record<string, any>
        }
    ) {
        const { filter = {}, payload } = options
        const db = this.cloudbaseService.db
        const collection = this.cloudbaseService.collection(resource)

        const data = _.omit(payload, '_id')

        return collection
            .where({
                _id: db.command.in(filter.ids),
            })
            .update(data)
    }

    async createOne(
        resource: string,
        options: {
            payload?: Record<string, any>
        }
    ) {
        const { payload } = options
        const collection = this.cloudbaseService.collection(resource)

        const data = {
            ...payload,
            createTime: payload?.createTime ? new Date(payload?.createTime) : new Date(),
            updateTime: new Date(),
        }

        return collection.add(data)
    }

    async deleteOne(resource: string, options: { filter: { _id?: string } }) {
        const { filter = {} } = options
        const collection = this.cloudbaseService.collection(resource)

        const { data } = await collection
            .where({
                _id: filter._id,
            })
            .limit(1)
            .get()

        if (!data?.length) {
            return {
                deleted: 0,
            }
        }

        return collection.doc(data[0]?._id).remove()
    }

    async deleteMany(resource: string, options: { filter: { ids?: string[] } }) {
        const { filter = {} } = options
        const db = this.cloudbaseService.db
        const collection = this.cloudbaseService.collection(resource)

        return collection
            .where({
                _id: db.command.in(filter.ids),
            })
            .remove()
    }
}
