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
import { getEnvIdString, dateToUnixTimestampInMs, randomId, getCloudBaseManager } from '@/utils'
import { Collection } from '@/constants'
import { OperationService } from './operation.service'

class MessageTaskBody {
  @IsNotEmpty()
  content: string

  @IsNotEmpty()
  @MaxLength(1000, {
    each: true,
  })
  phoneNumberList: string[]

  @IsNotEmpty()
  activityId: string

  @IsNotEmpty()
  createdUser: any
}

class EnableServiceBody {
  @IsNotEmpty()
  miniappName: string

  @IsNotEmpty()
  miniappID: string

  @IsNotEmpty()
  miniappOriginalID: string
}

@UseGuards(PermissionGuard('operation'))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('projects/:projectId/operation')
export class OperationController {
  constructor(
    public readonly cloudbaseService: CloudBaseService,
    private readonly operationService: OperationService
  ) {}

  /**
   * 开启未登录
   */
  @Post('enableNonLogin')
  async createNonLogin() {
    // 开启未登录
    await this.operationService.enableNonLogin()
    // 修改安全规则
    await this.operationService.updateSecurityRules()
  }

  /**
   * 开启营销工具
   */
  @Post('enableOperationService')
  async createOperationService(@Body() payload: EnableServiceBody) {
    const { data: settings } = await this.collection(Collection.Settings).where({}).get()

    const appConfig = {
      ...payload,
      enableOperation: true,
    }

    // 生成活动模板
    await this.operationService.generateTemplate(appConfig)

    // setting 为空，直接添加数据
    if (!settings?.length) {
      await this.collection(Collection.Settings).add(appConfig)
    } else {
      // 存储小程序信息
      await this.collection(Collection.Settings).where({}).update(appConfig)
    }

    // 添加默认活动
    const {
      data: [record],
    } = await this.collection(Collection.MessageActivity).where({}).get()

    // 添加默认活动
    if (!record) {
      const now = Date.now()
      await this.collection(Collection.MessageActivity).add({
        activityName: '营销demo',
        endTime: 1893456000000,
        isActivityOpen: true,
        startTime: 1610353674000,
        _createTime: now,
        _updateTime: now,
      })
    }
  }

  /**
   * 创建发送短信的任务
   */
  @Post('createBatchTask')
  async createBatchTask(@Param('projectId') projectId, @Body() body: MessageTaskBody) {
    const envId = getEnvIdString()
    const { content, phoneNumberList, activityId, createdUser } = body

    // 写入 task 记录
    const taskRes = await this.collection(Collection.MessageTasks).add({
      // 短信内容
      content,
      projectId,
      // 关联的活动 ID
      activityId,
      // 创建用户
      createdUser,
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
      type: 'smstask',
      // 创建时间
      createTime: Date.now(),
    })

    return {
      taskId,
      token,
    }
  }

  /**
   * 查询短信任务发送结果
   */
  @Post('getSmsTaskResult')
  async getSmsTaskResult(@Body() body: { queryId: string; page: number; pageSize: number }) {
    const { queryId, page = 1, pageSize = 10 } = body

    const envId = getEnvIdString()
    const manager = await getCloudBaseManager()

    const { SmsRecords, TotalCount } = await manager.commonService().call({
      Action: 'DescribeSmsRecords',
      Param: {
        EnvId: envId,
        QueryId: queryId,
        PageNumber: page,
        PageSize: pageSize,
      },
    })

    return {
      total: TotalCount,
      data: SmsRecords,
    }
  }

  collection(collection = Collection.DataMigrateTasks) {
    return this.cloudbaseService.collection(collection)
  }
}
