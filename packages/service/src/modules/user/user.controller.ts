import { Controller, Post, Body, Get, Query, Delete, Param } from '@nestjs/common'

import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2 } from '@/constants'
import { IsNotEmpty } from 'class-validator'
import { RecordExistException } from '@/common'
import { genPassword, getEnvIdString, dateToNumber } from '@/utils'

class User {
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    password: string

    @IsNotEmpty()
    role: string

    projectId: string

    collections: string[]

    actions: string[]
}

@Controller('user')
export class UserController {
    constructor(private readonly cloudbaseService: CloudBaseService) {}

    // TODO: auth
    @Get()
    async getUsers(@Query() query: { page?: number; pageSize?: number } = {}) {
        const { page = 1, pageSize = 10 } = query

        const { data, requestId } = await this.cloudbaseService
            .collection(CollectionV2.Users)
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
    async createSchema(@Body() body: User) {
        // 检查集合是否存在
        const { data } = await this.cloudbaseService
            .collection(CollectionV2.Users)
            .where({
                username: body.username
            })
            .get()

        if (data?.length) {
            throw new RecordExistException()
        }
        const envId = getEnvIdString()

        body.password = await genPassword(body.password, `${dateToNumber()}${envId}`)

        return this.cloudbaseService.collection(CollectionV2.Users).add(body)
    }

    @Delete(':id')
    async deleteSchema(@Param('id') userId) {
        return this.cloudbaseService.collection(CollectionV2.Users).doc(userId).remove()
    }
}
