import { Controller, Get, Query, Post, Body, Put } from '@nestjs/common'
import { CloudBaseService } from '@/dynamic_modules'
import { CmsException, RecordExistException } from '@/common'
import { SchemaService } from './schema.service'
import { CompatibleSchema } from './types'

@Controller('schema')
export class SchemaController {
    constructor(private schemaService: SchemaService, private cloudbaseService: CloudBaseService) {}

    @Get()
    async getSchemas(@Query() query: { page?: number; pageSize?: number; version?: string } = {}) {
        const { page = 1, pageSize = 100, version = '2.0' } = query

        const schemaColl = this.schemaService.getSchemaColl(version)

        const { data, requestId } = await this.cloudbaseService
            .collection(schemaColl)
            .where({})
            .skip(Number(page - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .get()

        return {
            data,
            requestId
        }
    }

    @Post()
    async createSchema(@Body() body: { version: string; payload: CompatibleSchema }) {
        const { version = '2.0', payload } = body

        const schemaColl = this.schemaService.getSchemaColl(version)
        const collName = payload.collectionName || payload.collection_name

        // 检查集合是否存在
        const exist = await this.cloudbaseService
            .collection(schemaColl)
            .where({
                collectionName: collName,
                collection_name: collName
            })
            .get()

        if (exist) {
            throw new RecordExistException()
        }

        const code = await this.schemaService.createCollection(collName)

        if (code) {
            throw new CmsException(code, '创建集合失败')
        }

        const res = await this.cloudbaseService.collection(schemaColl).add({
            ...payload,
            _create_time: new Date()
        })

        console.log('res')

        return res
    }

    @Put()
    async updateSchema(@Body() body: { version: string; payload: CompatibleSchema }) {
        const { version = '2.0', payload } = body

        const schemaColl = this.schemaService.getSchemaColl(version)
        return this.cloudbaseService
            .collection(schemaColl)
            .where({
                _id: payload._id
            })
            .update(payload)
    }
}
