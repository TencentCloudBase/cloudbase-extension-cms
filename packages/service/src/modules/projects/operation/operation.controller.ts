import _ from 'lodash'
import {
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { PermissionGuard } from '@/guards'
import { CloudBaseService } from '@/services'
import { IsNotEmpty, MaxLength } from 'class-validator'
import { getEnvIdString, dateToUnixTimestampInMs, randomId } from '@/utils'
import { Collection, SYSTEM_ROLE_IDS } from '@/constants'
import { OperationService } from './operation.service'

class MessageTaskBody {
  @IsNotEmpty()
  content: string

  @IsNotEmpty()
  @MaxLength(1000, {
    each: true,
  })
  phoneNumberList: string[]

  appPath: string

  appPathQuery: string
}

class EnableServiceBody {
  @IsNotEmpty()
  miniappName: string

  @IsNotEmpty()
  miniappID: string

  @IsNotEmpty()
  miniappOriginalID: string
}

@UseGuards(PermissionGuard('content', [SYSTEM_ROLE_IDS.ADMIN]))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/operation')
export class OperationController {
  constructor(
    public readonly cloudbaseService: CloudBaseService,
    private readonly operationService: OperationService
  ) {}

  /**
   * 开启营销工具
   */
  @Post('enableOperationService')
  async enableOperationService(@Body() payload: EnableServiceBody) {
    // 开启未登录
    await this.operationService.enableNonLogin()
    // 修改安全规则
    await this.operationService.writeSecurityRules()

    const { data: settings } = await this.collection(Collection.Settings).where({}).get()

    const appConfig = {
      ...payload,
      enableOperation: true,
    }

    // setting 为空，直接添加数据
    if (!settings?.length) {
      await this.collection(Collection.Settings).add(appConfig)
    } else {
      // 存储小程序信息
      await this.collection(Collection.Settings).where({}).update(appConfig)
    }

    // 生成活动模板
    await this.operationService.generateTemplate(appConfig)
  }

  /**
   * 创建群发短信的任务
   */
  @Post('createBatchTask')
  async createBatchTask(@Param('projectId') projectId, @Body() body: MessageTaskBody) {
    const envId = getEnvIdString()
    const { content, phoneNumberList, appPath, appPathQuery } = body

    // 写入 task 记录
    const taskRes = await this.collection(Collection.MessageTasks).add({
      // 应用路径
      appPath,
      appPathQuery,
      // 短信内容
      content,
      projectId,
      phoneNumberList,
      // 已创建
      status: 'created',
      total: phoneNumberList.length,
      createTime: dateToUnixTimestampInMs(),
    })

    const taskId = taskRes.id
    const token = randomId(128)

    // 生成一个 token，用于下发短信任务的鉴权
    await this.collection(Collection.MessageAuthToken).add({
      // 环境 id，此 token 仅能触发此环境的任务
      envId,
      // 验证 token
      token,
      // 任务 Id
      taskId,
      // 创建时间
      createTime: Date.now(),
    })

    return {
      taskId,
      token,
    }
  }

  collection(collection = Collection.DataMigrateTasks) {
    return this.cloudbaseService.collection(collection)
  }
}
