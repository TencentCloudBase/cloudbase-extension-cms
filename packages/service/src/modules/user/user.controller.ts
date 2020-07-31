import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { CloudBase } from '@cloudbase/node-sdk/lib/cloudbase'

import { genPassword, getEnvIdString } from '@/utils'
import config from '@/config'

@Controller('user')
export class UserController {
    // login by username and password
    @Post('account')
    async login(@Body() body) {
        const { userName, password } = body

        // if (!userName || !password) {
        //   return {
        //     message: '用户名或者密码不能为空',
        //     code: 'LOGIN_WRONG_INPUT'
        //   }
        // }

        return {
            code: 'ok'
        }

        // // 查询用户信息
        // const collection = this.app.database().collection(config.collection.users)
        // const query = collection.where({
        //   userName
        // })
        // const getRes = await query.get()
        // const dbRecord = getRes.data[0]

        // if (!dbRecord) {
        //   return {
        //     message: '用户名或者密码错误',
        //     code: 'LOGIN_WRONG_INPUT'
        //   }
        // }

        // const { password: dbPassword, createTime, role, failedLogins } = dbRecord
        // const now = new Date()
        // const todayDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

        // if (failedLogins?.[todayDate] >= 5) {
        //   return {
        //     message: '登录失败次数过多，请明日再试',
        //     code: 'LOGIN_RETRY_TOO_MANY'
        //   }
        // }

        // // 对密码加密
        // const envId = getEnvIdString()
        // console.log('环境 Id', envId)
        // const salt = createTime + envId
        // console.log(salt)
        // const genPasswordResult = await genPassword(password, salt)

        // console.log(genPasswordResult, dbPassword)

        // if (genPasswordResult !== dbPassword) {
        //   await collection.doc(dbRecord._id).update({
        //     failedLogins: {
        //       [todayDate]: failedLogins ? failedLogins[todayDate] + 1 : 1
        //     }
        //   })

        //   return {
        //     message: '用户名或者密码错误',
        //     code: 'LOGIN_WRONG_INPUT'
        //   }
        // }
    }
}
