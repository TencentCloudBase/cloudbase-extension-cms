import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Delete,
    Param,
    UseInterceptors,
    ClassSerializerInterceptor
} from '@nestjs/common'

import { CloudBaseService } from '@/dynamic_modules'
import { CollectionV2 } from '@/constants'
import { IsNotEmpty } from 'class-validator'
import { RecordExistException } from '@/common'
import { genPassword, getEnvIdString, dateToNumber } from '@/utils'
import { Expose, Type } from 'class-transformer'

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

    // 兼容老版本，将 userName 转换成 username
    @Expose({ name: 'username' })
    userName?: string
}

class GetUserRes {
    @Type(() => User)
    data: User[]

    requestId: string

    constructor(partial: Partial<GetUserRes>) {
        Object.assign(this, partial)
    }
}

@Controller('user')
export class UserController {
    constructor(private readonly cloudbaseService: CloudBaseService) {}

    // TODO: auth
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    async getUsers(@Query() query: { page?: number; pageSize?: number } = {}): Promise<GetUserRes> {
        const { page = 1, pageSize = 10 } = query

        const { data, requestId } = await this.cloudbaseService
            .collection(CollectionV2.Users)
            .where({})
            .skip(Number(page - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .get()

        return new GetUserRes({
            data,
            requestId
        })
    }

    @Post()
    async createUser(@Body() body: User) {
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
    async deleteUser(@Param('id') userId) {
        return this.cloudbaseService.collection(CollectionV2.Users).doc(userId).remove()
    }
}
