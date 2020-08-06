import {
    Get,
    Post,
    Put,
    Body,
    Query,
    Param,
    Delete,
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor
} from '@nestjs/common'
import { CollectionV2 } from '@/constants'
import { CloudBaseService } from '@/dynamic_modules'
import { CmsException, RecordExistException } from '@/common'
import { SchemaService } from './schema.service'
import { SchemaTransfromPipe } from './schema.pipe'
import { SchemaV2 } from './types'

@UseInterceptors(ClassSerializerInterceptor)
@Controller('schema')
export class SchemaController {
    constructor(private schemaService: SchemaService, private cloudbaseService: CloudBaseService) {}

    @Get()
    async getSchemas(
        @Query() query: { projectId?: string; page?: number; pageSize?: number } = {}
    ) {
        const { projectId, page = 1, pageSize = 100 } = query

        const { data, requestId } = await this.cloudbaseService
            .collection(CollectionV2.Schemas)
            .where({
                projectId
            })
            .skip(Number(page - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .get()

        return {
            data,
            requestId
        }
    }

    @Get(':id')
    async getSchema(@Param('id') schemaId) {
        const { data, requestId } = await this.cloudbaseService
            .collection(CollectionV2.Schemas)
            .doc(schemaId)
            .get()

        return {
            data: data?.[0],
            requestId
        }
    }

    @Post()
    async createSchema(@Body(new SchemaTransfromPipe('create')) body: SchemaV2) {
        // 检查集合是否存在
        const { data } = await this.cloudbaseService
            .collection(CollectionV2.Schemas)
            .where({
                projectId: body.projectId,
                collectionName: body.collectionName
            })
            .get()

        if (data?.length) {
            throw new RecordExistException()
        }

        const code = await this.schemaService.createCollection(body.collectionName)
        if (code) {
            throw new CmsException(code, '创建集合失败')
        }

        const res = await this.cloudbaseService.collection(CollectionV2.Schemas).add(body)

        return res
    }

    @Put(':id')
    async updateSchema(
        @Param('id') schemaId,
        @Body(new SchemaTransfromPipe('update')) payload: SchemaV2
    ) {
        return this.cloudbaseService
            .collection(CollectionV2.Schemas)
            .where({
                _id: schemaId
            })
            .update(payload)
    }

    @Delete(':id')
    async deleteSchema(@Param('id') schemaId, @Body() body: { deleteCollection: boolean }) {
        const { deleteCollection } = body

        const { data } = await this.cloudbaseService
            .collection(CollectionV2.Schemas)
            .doc(schemaId)
            .get()

        const schema = data?.[0]

        const res = await this.cloudbaseService
            .collection(CollectionV2.Schemas)
            .where({
                _id: schemaId
            })
            .remove()

        if (deleteCollection) {
            await this.schemaService.deleteCollection(schema.collectionName)
        }

        return res
    }
}
